/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

import dotenv from 'dotenv';
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
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    NEXT_PUBLIC_POSTHOG_HOST:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    NEXT_PUBLIC_ENABLE_ANALYTICS:
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || 'false',
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
  publicRuntimeConfig: {
    // Analytics can be dynamically enabled/disabled
    analyticsEnabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
};

module.exports = nextConfig;
