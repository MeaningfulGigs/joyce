/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CHRISTO_TOKEN: process.env.CHRISTO_TOKEN,
  },
};

module.exports = nextConfig;
