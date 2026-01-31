/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@stellar/stellar-sdk'],
};

module.exports = nextConfig;
