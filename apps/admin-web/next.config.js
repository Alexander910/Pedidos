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
}

module.exports = nextConfig
