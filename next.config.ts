import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "xn--q20b145avpd59fmvg.com" }],
        destination: "https://www.xn--q20b145avpd59fmvg.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      }
    ],
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
