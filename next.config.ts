import type { NextConfig } from "next";
const optimizeLocales = require('@react-aria/optimize-locales-plugin');

const nextConfig: NextConfig = {
  webpack(config) {
    config.plugins.push(
      optimizeLocales.webpack({
        locales: ['en-US']
      })
    );
    return config;
  }
};

export default nextConfig;
