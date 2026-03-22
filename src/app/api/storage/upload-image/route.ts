import { getSignUser } from '@/shared/models/user';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { md5 } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { getAllConfigs } from '@/shared/models/config';
import { getStorageService } from '@/shared/services/storage';

const extFromMime = (mimeType: string) => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return map[mimeType] || '';
};

const R2_UPLOAD_PREFIX = 'avatars';

function getUploadsBucket(): any | null {
  try {
    const { env }: { env: any } = getCloudflareContext();
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

    const configs = await getAllConfigs();
    const storageService = await getStorageService(configs);
    const uploadsBucket = getUploadsBucket();
    const uploadResults = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return respErr(`File ${file.name} is not an image`);
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
