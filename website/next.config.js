/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const dotenv = require('dotenv'); // eslint-disable-line
dotenv.config();

// Default API URL for development
let apiUrl = 'http://localhost:8080';

// If in production, use the production API URL
if (isProd) {
  apiUrl = 'https://api.applicantatlas.com';
} else if (process.env.CODESPACES) {
  // If running in GitHub Codespaces (and not in production), set the API URL dynamically
  apiUrl = `https://${process.env.CODESPACE_NAME}-8080.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,

    // PostHog analytics
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    NEXT_PUBLIC_POSTHOG_HOST:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    NEXT_PUBLIC_ENABLE_ANALYTICS:
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || 'false',

    // Sentry
    NEXT_PUBLIC_ENABLE_SENTRY: process.env.NEXT_PUBLIC_ENABLE_SENTRY || 'false',
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
    ],
  },
};

module.exports = nextConfig;

if (process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true') {
  const { withSentryConfig } = require('@sentry/nextjs'); // eslint-disable-line @typescript-eslint/no-var-requires
  module.exports = withSentryConfig(module.exports, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: process.env.NEXT_PUBLIC_SENTRY_ORG,
    project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  });
}
