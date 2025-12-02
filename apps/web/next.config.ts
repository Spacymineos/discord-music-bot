import type { NextConfig } from 'next';
import path from 'path';

/** @type {NextConfig} */
const nextConfig: NextConfig = {
    turbopack: {
        root: path.join(__dirname, '../..'),
    },
    images: {
        unoptimized: true, // Disable optimization for external images to prevent timeouts
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.discordapp.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i1.sndcdn.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.scdn.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.ytimg.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.sndcdn.com',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
