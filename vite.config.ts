import { defineConfig } from 'vite';
import { resolve } from 'path';

// Multi-page static site build: every top-level HTML page is its own entry.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        programs: resolve(__dirname, 'programs.html'),
        events: resolve(__dirname, 'events.html'),
        volunteer: resolve(__dirname, 'volunteer.html'),
        contact: resolve(__dirname, 'contact.html'),
        blog: resolve(__dirname, 'blog.html'),
        admin: resolve(__dirname, 'admin.html'),
        apply: resolve(__dirname, 'apply.html'),
      },
    },
  },
});
