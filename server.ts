import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Realistic Chrome / Desktop Browser Fingerprint Headers
  const BROWSER_PROFILES = {
    chrome_desktop: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    },
    safari_iphone: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja-JP,ja;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none'
    }
  };

  // API 1: Live Web Bypass Proxy Engine (Anti-Bot Headers & Link Rewriting)
  app.get('/api/proxy/fetch', async (req, res) => {
    const rawUrl = req.query.url as string;
    const profileKey = (req.query.profile as string) || 'chrome_desktop';
    const stripTracking = req.query.stripTracking === 'true';

    if (!rawUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const baseHeaders = BROWSER_PROFILES[profileKey as keyof typeof BROWSER_PROFILES] || BROWSER_PROFILES.chrome_desktop;
    const requestHeaders: Record<string, string> = {
      ...baseHeaders,
      'Host': parsedUrl.host,
    };

    if (stripTracking) {
      delete requestHeaders['Referer'];
    }

    const startTime = Date.now();

    const options = {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: requestHeaders,
      rejectUnauthorized: false
    };

    const proxyReq = client.request(options, (proxyRes) => {
      const encoding = proxyRes.headers['content-encoding'];
      let stream: NodeJS.ReadableStream = proxyRes;

      if (encoding === 'gzip') {
        stream = proxyRes.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        stream = proxyRes.pipe(zlib.createInflate());
      } else if (encoding === 'br') {
        stream = proxyRes.pipe(zlib.createBrotliDecompress());
      }

      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));

      stream.on('end', () => {
        const duration = Date.now() - startTime;
        const contentType = proxyRes.headers['content-type'] || 'text/html';
        const rawBody = Buffer.concat(chunks).toString('utf-8');

        // Check for bot detection flags in response
        const isBotBlocked = 
          proxyRes.statusCode === 403 || 
          proxyRes.statusCode === 429 || 
          rawBody.includes('Cloudflare') && rawBody.includes('Attention Required') ||
          rawBody.includes('cf-browser-verification') ||
          rawBody.includes('Access Denied');

        let processedHtml = rawBody;
        if (contentType.includes('text/html')) {
          // Inject base href tag so images/CSS load properly
          const baseTag = `<base href="${parsedUrl.origin}/">`;
          if (processedHtml.includes('<head>')) {
            processedHtml = processedHtml.replace('<head>', `<head>${baseTag}`);
          } else if (processedHtml.includes('<HEAD>')) {
            processedHtml = processedHtml.replace('<HEAD>', `<HEAD>${baseTag}`);
          }
        }

        res.json({
          success: true,
          statusCode: proxyRes.statusCode || 200,
          statusMessage: proxyRes.statusMessage,
          latencyMs: duration,
          url: parsedUrl.toString(),
          contentType,
          headersSent: requestHeaders,
          headersReceived: proxyRes.headers,
          isBotBlocked,
          botScore: isBotBlocked ? 'BLOCKED_BOT' : 'HUMAN_VERIFIED (200 OK)',
          content: processedHtml
        });
      });

      stream.on('error', (err) => {
        res.status(502).json({
          success: false,
          error: `Stream decompression failed: ${err.message}`
        });
      });
    });

    proxyReq.on('error', (err) => {
      res.status(502).json({
        success: false,
        error: `Connection to target failed: ${err.message}`
      });
    });

    proxyReq.end();
  });

  // API 2: Direct Bypass Stream (Embeddable proxy renderer)
  app.get('/proxy-stream', (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) return res.status(400).send('URL query parameter required');

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    } catch {
      return res.status(400).send('Invalid URL format');
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestHeaders = {
      ...BROWSER_PROFILES.chrome_desktop,
      'Host': parsedUrl.host
    };

    const proxyReq = client.request({
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: requestHeaders,
      rejectUnauthorized: false
    }, (proxyRes) => {
      const responseHeaders = { ...proxyRes.headers };
      delete responseHeaders['x-frame-options'];
      delete responseHeaders['content-security-policy'];

      const contentType = proxyRes.headers['content-type'] || '';
      const encoding = proxyRes.headers['content-encoding'];
      let stream: NodeJS.ReadableStream = proxyRes;

      if (encoding === 'gzip') stream = proxyRes.pipe(zlib.createGunzip());
      else if (encoding === 'deflate') stream = proxyRes.pipe(zlib.createInflate());
      else if (encoding === 'br') stream = proxyRes.pipe(zlib.createBrotliDecompress());

      if (contentType.includes('text/html')) {
        const chunks: Buffer[] = [];
        stream.on('data', (c: Buffer) => chunks.push(c));
        stream.on('end', () => {
          let html = Buffer.concat(chunks).toString('utf-8');
          const baseTag = `<base href="${parsedUrl.origin}/">`;
          if (html.includes('<head>')) html = html.replace('<head>', `<head>${baseTag}`);
          else if (html.includes('<HEAD>')) html = html.replace('<HEAD>', `<HEAD>${baseTag}`);

          delete responseHeaders['content-encoding'];
          delete responseHeaders['content-length'];
          res.writeHead(proxyRes.statusCode || 200, responseHeaders);
          res.end(html);
        });
      } else {
        delete responseHeaders['content-encoding'];
        res.writeHead(proxyRes.statusCode || 200, responseHeaders);
        stream.pipe(res);
      }
    });

    proxyReq.on('error', (err) => {
      res.status(502).send(`Bypass Error: ${err.message}`);
    });

    proxyReq.end();
  });

  // Mount Vite middleware in development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 RasPi Web Proxy Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
