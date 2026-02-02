import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
   future: {
    compatibilityVersion: 4
  },
  devtools: { enabled: true },
/*   imports: {
    autoImport: true,
  }, */
  components: true,
  ssr:true,
  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

supabase: {
  redirect: false // ← Isso resolve o 404!
},
runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabasePublishableKey: process.env.SSUPABASE_KEY,
    },
  },
  modules: ["@nuxtjs/supabase", "@nuxtjs/google-fonts"],
  googleFonts: {
    base64: true,
    overwriting: true,
    families: {
      'Geist Mono': [400, 500, 700],
    },
  },
});