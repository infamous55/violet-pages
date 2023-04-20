// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

import nextPWA from "next-pwa";
const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === "development",
});

/** @type {import("next").NextConfig} */
const config = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    domains: [
      // @ts-ignore
      process.env.NEXT_PUBLIC_BUCKET_URL.replace("https://", ""),
      "lh3.googleusercontent.com",
    ],
  },
  experimental: {
    swcPlugins: [["next-superjson-plugin", {}]],
  },
});
export default config;
