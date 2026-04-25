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
            // Mimic a real browser GET request to avoid Cloudflare 405 rejection
            proxyReq.method = 'GET';
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
            proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8');
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9,de;q=0.8');
            proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
            proxyReq.setHeader('Cache-Control', 'no-cache');
            proxyReq.setHeader('Pragma', 'no-cache');
            proxyReq.setHeader('Referer', 'https://www.transfermarkt.com/');
            proxyReq.setHeader('Upgrade-Insecure-Requests', '1');
            proxyReq.setHeader('Connection', 'keep-alive');
            proxyReq.setHeader('Sec-Fetch-Dest', 'document');
            proxyReq.setHeader('Sec-Fetch-Mode', 'navigate');
            proxyReq.setHeader('Sec-Fetch-Site', 'same-origin');
            proxyReq.setHeader('Sec-Fetch-User', '?1');
            // Remove headers that trigger WAF rejection
            proxyReq.removeHeader('cookie');
            proxyReq.removeHeader('transfer-encoding');
            proxyReq.removeHeader('origin');
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