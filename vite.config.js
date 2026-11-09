import { defineConfig } from 'vite';
import fs from 'fs';
import { join } from 'path';

export default defineConfig({
  server: {
    fs: { allow: ['..'] },
    configureServer(server) {
      // Serve examples/minimal.html directly, bypassing Vue SPA fallback.
      server.middlewares.use((req, res, next) => {
        if (req.url === '/examples/minimal.html') {
          const filePath = join(process.cwd(), 'examples', 'minimal.html');
          res.setHeader('Content-Type', 'text/html');
          res.statusCode = 200;
          fs.createReadStream(filePath).pipe(res);
          return;
        }
        next();
      });
    },
  },
});
