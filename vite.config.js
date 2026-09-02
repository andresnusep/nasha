import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Tiny middleware: serve a static public/ subfolder's index.html for a
// given path and its trailing-slash variant. Vite's SPA history fallback
// would otherwise grab these and return the React app's index.html —
// making e.g. /admin or /bpm look like a plain re-render of /.
function staticSubpageRoute(urlPath, htmlFile) {
  return {
    name: `serve-static-${urlPath.replace(/\//g, '')}`,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === urlPath || req.url === `${urlPath}/` || req.url === `${urlPath}/index.html`) {
          const html = readFileSync(resolve(__dirname, htmlFile), 'utf8');
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
  plugins: [
    react(),
    staticSubpageRoute('/admin', 'public/admin/index.html'),
    staticSubpageRoute('/bpm', 'public/bpm/index.html'),
  ],
});
