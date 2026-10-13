// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],

//   server: {
//     port: 5173,
//     strictPort: true,
//     proxy: {
//       "/api": {
//         target: "http://localhost:5000", // backend server
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },

//   define: {
//     __APP_ENV__: JSON.stringify(process.env.NODE_ENV),
//   },
// });


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host:true,
    port: 5173,
    strictPort: true,

    // ✅ Ngrok fix
    allowedHosts: true,

    proxy: {
      "/api": {
        target: "http://localhost:3000", // backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },

  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV),
  },
});