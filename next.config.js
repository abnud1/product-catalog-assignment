/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  rewrites() {
    return Promise.resolve([
      {
        source: "/api/:path*",
        destination: "https://dummyapi.online/api/:path*",
      },
    ]);
  },
};

// eslint-disable-next-line unicorn/prefer-module
module.exports = nextConfig;
