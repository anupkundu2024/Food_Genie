// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for the React app.
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite dev-server port.
  },
});
