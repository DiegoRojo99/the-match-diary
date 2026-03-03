import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        port: "",
        pathname: "**",
      },
    ],
  },
  // Allow development access from local network devices
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      '192.168.8.193',
      '192.168.*',
      'localhost'
    ]
  })
};

export default nextConfig;
