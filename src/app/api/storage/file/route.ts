import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

const SAFE_KEY_PATTERN = /^[a-zA-Z0-9/_\-.]+$/;

function getUploadsBucket(): any | null {
  try {
    const { env }: { env: any } = getCloudflareContext();
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
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  return new NextResponse(object.body, {
    headers,
  });
}
