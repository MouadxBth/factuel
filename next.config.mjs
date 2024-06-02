/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "dapper-cobra-187.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
