import { NextRequest, NextResponse } from 'next/server';

function isSafeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // Only allow https (prevent file:/// and local protocols)
    if (url.protocol !== 'https:') return false;

    // Block internal/local network addresses
    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    const isPrivateIP =
      url.hostname.startsWith('10.') ||
      url.hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname);

    if (isLocal || isPrivateIP) return false;
    
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url || !isSafeUrl(url)) {
    return new NextResponse('Missing or invalid url parameter', { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch file: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
