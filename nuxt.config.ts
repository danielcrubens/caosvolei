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
  ssr: false, // SPA - ideal para apps internos sem necessidade de SEO
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
    // Credenciais PRIVADAS (apenas servidor)
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    public: {
      // NADA exposto ao cliente
    }
  },
  modules: ["@nuxtjs/supabase", "@nuxtjs/google-fonts"],
  googleFonts: {
    overwriting: true,
    families: {
      'Geist Mono': [400, 500, 700],
    },
  },
});