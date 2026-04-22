import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tm': {
        target: 'https://www.transfermarkt.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/tm/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Override headers per-request at the Node level
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
            proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
            proxyReq.setHeader('Cache-Control', 'no-cache');
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Expose the final URL TM landed on so the browser can see it
            const finalUrl = proxyRes.headers['x-final-url'] || '';
            res.setHeader('X-Proxy-Final-URL', finalUrl);

            // If TM redirected, rewrite Location back through /tm
            if ([301, 302, 303, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
              let loc = proxyRes.headers.location;
              if (loc.startsWith('/')) {
                proxyRes.headers.location = '/tm' + loc;
              } else if (loc.startsWith('https://www.transfermarkt.com')) {
                proxyRes.headers.location = loc.replace('https://www.transfermarkt.com', '/tm');
              }
              // Also expose where we got redirected to
              res.setHeader('X-Redirected-To', proxyRes.headers.location);
            }
          });
        },
      },
      '/httpbin': {
        target: 'https://httpbin.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/httpbin/, ''),
      }
    }
  }
})