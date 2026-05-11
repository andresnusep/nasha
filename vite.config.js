import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Tiny middleware: serve /admin and /admin/ as the Decap CMS HTML.
// Vite's SPA history fallback would otherwise grab these and return the
// React app's index.html — making /admin look like a plain re-render of /.
function adminRoute() {
  return {
    name: 'serve-admin-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/admin' || req.url === '/admin/' || req.url === '/admin/index.html') {
          const html = readFileSync(resolve(__dirname, 'public/admin/index.html'), 'utf8');
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), adminRoute()],
});
