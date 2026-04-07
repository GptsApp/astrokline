import { NextRequest, NextResponse } from 'next/server';
import { getSignUser } from '@/shared/models/user';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';


export async function GET(request: NextRequest) {
  try {
    const user = await getSignUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const tier = await getAstroUserTier(user);
    if (tier === 'FREE') {
      return NextResponse.json({ error: 'PDF export requires Lite or Pro plan' }, { status: 403 });
    }

    const klineId = request.nextUrl.searchParams.get('id');
    if (!klineId) {
      return NextResponse.json({ error: 'Missing kline ID' }, { status: 400 });
    }

    // Get the CF Browser binding via getCloudflareContext
    let browserBinding: any;
    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const ctx = await getCloudflareContext({ async: true });
      browserBinding = (ctx.env as any)?.BROWSER;
    } catch {
      return NextResponse.json(
        { error: 'PDF export is only available in production (Cloudflare)' },
        { status: 501 }
      );
    }

    if (!browserBinding) {
      return NextResponse.json(
        { error: 'Browser Rendering not configured' },
        { status: 501 }
      );
    }

    // Use CF Browser Rendering REST API via the binding's fetch
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://astrokline.com';
    const printUrl = `${baseUrl}/en/kline/print/${klineId}`;

    // Forward auth cookies
    const cookieHeader = request.headers.get('cookie') || '';

    const pdfResponse = await browserBinding.fetch(
      `https://browser-rendering.cloudflare.com/pdf?url=${encodeURIComponent(printUrl)}`,
      {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
          'cf-browser-rendering-options': JSON.stringify({
            printBackground: true,
            format: 'A4',
            margin: { top: '12mm', bottom: '16mm', left: '10mm', right: '10mm' },
            waitUntil: 'networkidle0',
            timeout: 30000,
            viewport: { width: 1200, height: 800 },
          }),
        },
      }
    );

    if (!pdfResponse.ok) {
      const errText = await pdfResponse.text();
      console.error('Browser Rendering error:', errText);
      return NextResponse.json(
        { error: 'PDF generation failed' },
        { status: 502 }
      );
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="astrokline-report-${klineId.slice(0, 8)}.pdf"`,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error: any) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: error.message || 'PDF export failed' },
      { status: 500 }
    );
  }
}
