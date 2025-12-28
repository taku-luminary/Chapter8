/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "placehold.jp" },
                     { protocol: 'https', hostname: 'images.microcms-assets.io' }, // これを追加
    ],
  },
};

export default nextConfig;
