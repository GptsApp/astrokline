import bundleAnalyzer from '@next/bundle-analyzer';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import { createMDX } from 'fumadocs-mdx/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withMDX = createMDX();

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/core/i18n/request.ts',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // OpenNext Cloudflare will copy full packages listed here into the workerd bundle
  // when they expose a "workerd" export condition. `@libsql/client` does, and without
  // this the OpenNext bundler can fail to resolve it.
  serverExternalPackages: ['@libsql/client', '@libsql/isomorphic-ws'],
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    qualities: [60, 70, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  async redirects() {
    return [];
  },
  async headers() {
    return [
      {
        source: '/imgs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      // fs: {
      //   browser: './empty.ts', // We recommend to fix code imports before using this method
      // },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          maxSize: 20 * 1024 * 1024, // 20 MiB max per chunk to stay under CF 25 MiB limit
        },
      };
    }
    return config;
  },
  experimental: {
    mdxRs: false,
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons', 'recharts', '@visx/visx'],
  },
};

export default withBundleAnalyzer(withNextIntl(withMDX(nextConfig)));

const useCloudflareDevBindings =
  process.env.ENABLE_CLOUDFLARE_DEV === 'true' ||
  Boolean(process.env.CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE);

if (process.env.NODE_ENV === 'development' && useCloudflareDevBindings) {
  initOpenNextCloudflareForDev();
}
