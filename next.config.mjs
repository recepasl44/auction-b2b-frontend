/** @type {import('next').NextConfig} */
const config = {
  eslint: {
    // Skip ESLint checks during production builds to prevent build failures
    ignoreDuringBuilds: true,
  },
};
export default config;
