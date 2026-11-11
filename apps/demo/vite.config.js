import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

// Serve repository examples before Vue Router's SPA fallback. Without this,
// opening /examples/minimal.html under the demo server renders the Vue app.
const examples = new Map([
  ['/examples/minimal.html', resolve(repoRoot, 'examples/minimal.html')],
  ['/examples/standalone.html', resolve(repoRoot, 'examples/standalone.html')],
]);

function serveExamples() {
  return {
    name: 'shapy-serve-examples',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const { pathname } = new URL(req.url ?? '/', 'http://localhost');
          const filePath = examples.get(pathname);

          if (!filePath) {
            next();
            return;
          }

          const html = readFileSync(filePath, 'utf8');
          const transformed = await server.transformIndexHtml(pathname, html);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(transformed);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    serveExamples(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('shapy-')
        }
      }
    })
  ],
  optimizeDeps: {
    exclude: ['shapy-bg']
  }
});
