import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Custom plugin cho phép Vite xử lý public/index.html làm SPA entry point
 * - Ở chế độ dev: Chặn middleware để nạp và transform HTML từ public/index.html
 * - Ở chế độ build: Rollup đọc public/index.html, closeBundle đồng bộ ra dist/index.html
 */
function publicHtmlPlugin() {
  return {
    name: 'public-html-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url === '/' || url === '/index.html' || url === '/public/index.html') {
          try {
            const htmlPath = path.resolve(__dirname, 'public/index.html');
            if (fs.existsSync(htmlPath)) {
              let html = fs.readFileSync(htmlPath, 'utf-8');
              html = await server.transformIndexHtml(req.url, html);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html');
              return res.end(html);
            }
          } catch (e) {
            return next(e);
          }
        }
        next();
      });
    },
    closeBundle() {
      const generated = path.resolve(__dirname, 'dist/public/index.html');
      const target = path.resolve(__dirname, 'dist/index.html');
      if (fs.existsSync(generated)) {
        fs.copyFileSync(generated, target);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    publicHtmlPlugin(),
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'public/index.html')
    }
  }
});
