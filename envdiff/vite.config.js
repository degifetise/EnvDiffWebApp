import { defineConfig } from "vite";
import react from "@tailwindcss/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
