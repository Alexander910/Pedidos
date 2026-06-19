const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@envios-ya/shared",
    "@envios-ya/ui",
    "@envios-ya/firebase",
    "@envios-ya/business-logic",
    "@envios-ya/maps"
  ],
};

module.exports = withPWA(nextConfig);
