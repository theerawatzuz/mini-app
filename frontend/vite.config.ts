import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    // Optimize bundle size with esbuild (faster than terser)
    minify: "esbuild",
    // Code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunk
          vendor: ["react", "react-dom"],
          // Split map library into separate chunk
          maps: ["leaflet"],
        },
      },
    },
    // Set chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
});
