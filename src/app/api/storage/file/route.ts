import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

const SAFE_KEY_PATTERN = /^[a-zA-Z0-9/_\-.]+$/;
const SAFE_INLINE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
]);
type UploadObject = {
  body: ReadableStream | null;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
};
type UploadsBucket = {
  get(key: string): Promise<UploadObject | null>;
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

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');

  if (!key || !SAFE_KEY_PATTERN.test(key)) {
    return new NextResponse('Invalid key', { status: 400 });
  }

  const uploadsBucket = getUploadsBucket();
  if (!uploadsBucket) {
    return new NextResponse('Storage bucket is not configured', { status: 503 });
  }

  const object = await uploadsBucket.get(key);
  if (!object) {
    return new NextResponse('File not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  const contentType = headers.get('content-type') || 'application/octet-stream';
  const filename =
    key.split('/').pop()?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'download';

  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('x-content-type-options', 'nosniff');

  if (!SAFE_INLINE_CONTENT_TYPES.has(contentType)) {
    headers.set('content-disposition', `attachment; filename="${filename}"`);
  } else {
    headers.set('content-disposition', 'inline');
  }

  return new NextResponse(object.body, {
    headers,
  });
}
