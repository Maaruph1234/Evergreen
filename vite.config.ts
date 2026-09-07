import { defineConfig } from 'vite';
import { resolve } from 'path';

// Multi-page static site build: every top-level HTML page is its own entry.
export default defineConfig({
  build: {
    rollupOptions: {
      // jsPDF dynamically imports canvg only for its SVG-rendering path,
      // which this project never calls (we only use text/addImage/autoTable).
      // canvg pulls in a broken optional core-js resolution otherwise —
      // externalizing it keeps that unused code path out of the bundle.
      external: ['canvg'],
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
        status: resolve(__dirname, 'status.html'),
      },
    },
  },
});
