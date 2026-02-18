
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['firebase-admin'],
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyCdnxQQiH-7nUfieFVHZnHDQPZkYeay4oE',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'studio-7043955860-d5b24.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'studio-7043955860-d5b24',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'studio-7043955860-d5b24.firebasestorage.app',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '472528856781',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:472528856781:web:6ffe63e547439dcdd12b84',
    NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-REXLH30QKS',
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default pwaConfig(nextConfig);
