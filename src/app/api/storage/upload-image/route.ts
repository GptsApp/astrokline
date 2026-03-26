import { getSignUser } from '@/shared/models/user';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { md5 } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { getAllConfigs } from '@/shared/models/config';
import { getStorageService } from '@/shared/services/storage';

const MAX_UPLOAD_FILES = 4;
const MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
]);

const extFromMime = (mimeType: string) => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return map[mimeType] || '';
};

const R2_UPLOAD_PREFIX = 'avatars';
type UploadsBucket = {
  head(key: string): Promise<unknown>;
  put(
    key: string,
    value: Uint8Array,
    options?: {
      httpMetadata?: {
        contentType?: string;
        contentDisposition?: string;
        cacheControl?: string;
      };
    }
  ): Promise<void>;
};

function getUploadsBucket(): UploadsBucket | null {
  try {
    const { env } = getCloudflareContext() as {
      env: { USER_UPLOADS?: UploadsBucket };
    };
    return env.USER_UPLOADS || null;
  } catch {
    return null;
  }
}

function buildStorageProxyUrl(key: string) {
  return `/api/storage/file?key=${encodeURIComponent(key)}`;
}

export async function POST(req: Request) {
  try {
    const user = await getSignUser();
    if (!user) {
      return respErr('not login');
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    console.log('[API] Received files:', files.length);
    files.forEach((file, i) => {
      console.log(`[API] File ${i}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
      });
    });

    if (!files || files.length === 0) {
      return respErr('No files provided');
    }

    if (files.length > MAX_UPLOAD_FILES) {
      return respErr(`You can upload up to ${MAX_UPLOAD_FILES} files at a time`);
    }

    const configs = await getAllConfigs();
    const storageService = await getStorageService(configs);
    const uploadsBucket = getUploadsBucket();
    const uploadResults = [];

    for (const file of files) {
      if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
        return respErr(
          `File ${file.name} must be a JPG, PNG, WEBP, GIF, AVIF, HEIC, or HEIF image`
        );
      }

      if (file.size <= 0 || file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        return respErr(
          `File ${file.name} exceeds the ${Math.floor(MAX_UPLOAD_FILE_SIZE_BYTES / (1024 * 1024))} MB upload limit`
        );
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const body = new Uint8Array(arrayBuffer);

      const digest = md5(body);
      const ext = extFromMime(file.type) || file.name.split('.').pop() || 'bin';
      const key = uploadsBucket
        ? `${R2_UPLOAD_PREFIX}/${digest}.${ext}`
        : `${digest}.${ext}`;

      if (uploadsBucket) {
        const existingObject = await uploadsBucket.head(key);
        if (existingObject) {
          uploadResults.push({
            url: buildStorageProxyUrl(key),
            key,
            filename: file.name,
            deduped: true,
          });
          continue;
        }

        await uploadsBucket.put(key, body, {
          httpMetadata: {
            contentType: file.type,
            contentDisposition: 'inline',
            cacheControl: 'public, max-age=31536000, immutable',
          },
        });

        uploadResults.push({
          url: buildStorageProxyUrl(key),
          key,
          filename: file.name,
          deduped: false,
        });
        continue;
      }

      // If the same image already exists, reuse its URL to save storage space.
      // (Still depends on provider supporting signed HEAD + public url generation.)
      const exists = await storageService.exists({ key });
      if (exists) {
        const publicUrl =
          storageService.getPublicUrl({ key }) || buildStorageProxyUrl(key);
        if (publicUrl) {
          uploadResults.push({
            url: publicUrl,
            key,
            filename: file.name,
            deduped: true,
          });
          continue;
        }
      }

      // Upload to storage
      const result = await storageService.uploadFile({
        body,
        key: key,
        contentType: file.type,
        disposition: 'inline',
      });

      if (!result.success) {
        console.error('[API] Upload failed:', result.error);
        return respErr(result.error || 'Upload failed');
      }

      console.log('[API] Upload success:', result.url);

      uploadResults.push({
        url:
          result.provider === 'r2' && !configs.r2_domain
            ? buildStorageProxyUrl(key)
            : result.url || buildStorageProxyUrl(key),
        key: result.key || key,
        filename: file.name,
        deduped: false,
      });
    }

    console.log(
      '[API] All uploads complete. Returning URLs:',
      uploadResults.map((r) => r.url)
    );

    return respData({
      urls: uploadResults.map((r) => r.url),
      results: uploadResults,
    });
  } catch (e) {
    console.error('upload image failed:', e);
    const message =
      e instanceof Error && e.message === 'No storage provider configured'
        ? 'Storage is not configured. Set the USER_UPLOADS R2 bucket binding or configure R2 in Admin > Settings > Storage.'
        : 'upload image failed';
    return respErr(message);
  }
}
