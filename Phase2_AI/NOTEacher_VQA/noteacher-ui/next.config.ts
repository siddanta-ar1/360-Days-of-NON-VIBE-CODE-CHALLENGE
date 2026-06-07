// next.config.mjs
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public', // Where the service worker files will be generated
  disable: process.env.NODE_ENV === 'development', // Disable in dev mode to prevent caching nightmares
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config options here
  reactStrictMode: true,
};

export default withPWA(nextConfig);
