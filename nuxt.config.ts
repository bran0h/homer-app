// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "@nuxtjs/supabase",
    "@nuxtjs/color-mode",
  ],
  vite: {
    build: {
      rollupOptions: {
        external: ["sharp"],
      },
    },
  },
  app: {
    head: {
      title: "Homer",
      meta: [
        {
          name: "description",
          content: "Homer - Your Personal Home Management System",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon-32x32.png",
          sizes: "32x32",
        },
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon-16x16.png",
          sizes: "16x16",
        },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },
  ui: {
    theme: {
      colors: [
        "primary",
        "secondary",
        "tertiary",
        "info",
        "success",
        "warning",
        "error",
      ],
    },
  },

  i18n: {
    defaultLocale: "sk",
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "sk", name: "Slovenčina", file: "sk.json" },
    ],
  },
  runtimeConfig: {
    weatherKey: process.env.NUXT_WEATHER_KEY,
  },
  supabase: {
    redirect: true,
    types: "./shares/types/supabase.d.ts",
  },
});