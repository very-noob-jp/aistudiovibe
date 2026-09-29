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
  const CHROME_HEADERS = {
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
  };

  // Helper: Normalize input to either Google Search URL or direct Target URL
  function resolveTargetUrl(input: string, searchEngine = 'google'): string {
    const trimmed = input.trim();
    if (!trimmed) return 'https://www.google.com';

    // If it looks like a URL (starts with http://, https:// or contains domain like .com, .org, .jp, localhost)
    const isUrl = /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/i.test(trimmed) && !trimmed.includes(' ');

    if (isUrl) {
      return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
    }

    // Otherwise treat as a search query
    if (searchEngine === 'bing') {
      return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`;
    }
    if (searchEngine === 'duckduckgo') {
      return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`;
    }
    // Default: Google Search (hl=ja for Japanese language results)
    return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}&hl=ja&gl=jp`;
  }

  // Client DOM Interceptor Script: Injected into proxied HTML pages
  // Intercepts all <a> clicks and <form> submits so navigation stays inside RasPi proxy!
  const INJECTED_DOM_SCRIPT = `
  <script>
    (function() {
      // Notify parent app of current location
      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            type: 'RASPI_PROXY_NAVIGATED',
            url: window.location.href,
            title: document.title
          }, '*');
        } catch(e) {}
      }

      // Intercept link clicks
      document.addEventListener('click', function(e) {
        var target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }
        if (target && target.href && !target.href.startsWith('javascript:')) {
          var href = target.href;
          // Clean Google redirect URLs /url?q=https://...
          if (href.indexOf('google.com/url?') !== -1 || href.indexOf('/url?q=') !== -1) {
            try {
              var u = new URL(href);
              var actual = u.searchParams.get('q') || u.searchParams.get('url');
              if (actual) href = actual;
            } catch(err) {}
          }
          e.preventDefault();
          e.stopPropagation();
          window.location.href = '/proxy-stream?url=' + encodeURIComponent(href);
        }
      }, true);

      // Intercept form submissions (Google Search box, Wikipedia search, etc.)
      document.addEventListener('submit', function(e) {
        var form = e.target;
        if (form && form.action) {
          e.preventDefault();
          var actionUrl = form.action;
          var formData = new FormData(form);
          var params = new URLSearchParams();
          formData.forEach(function(val, key) {
            params.append(key, val);
          });
          var finalUrl = actionUrl + (actionUrl.indexOf('?') === -1 ? '?' : '&') + params.toString();
          window.location.href = '/proxy-stream?url=' + encodeURIComponent(finalUrl);
        }
      }, true);
    })();
  </script>
  `;

  // API 1: Fetch and return JSON with DOM processing
  app.get('/api/proxy/fetch', async (req, res) => {
    const rawInput = (req.query.url as string) || (req.query.q as string);
    const searchEngine = (req.query.engine as string) || 'google';

    if (!rawInput) {
      return res.status(400).json({ error: 'URL or Search Query is required' });
    }

    const resolvedUrl = resolveTargetUrl(rawInput, searchEngine);
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(resolvedUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestHeaders: Record<string, string> = {
      ...CHROME_HEADERS,
      'Host': parsedUrl.host,
    };

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

      if (encoding === 'gzip') stream = proxyRes.pipe(zlib.createGunzip());
      else if (encoding === 'deflate') stream = proxyRes.pipe(zlib.createInflate());
      else if (encoding === 'br') stream = proxyRes.pipe(zlib.createBrotliDecompress());

      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));

      stream.on('end', () => {
        const duration = Date.now() - startTime;
        const contentType = proxyRes.headers['content-type'] || 'text/html';
        const rawBody = Buffer.concat(chunks).toString('utf-8');

        let processedHtml = rawBody;
        if (contentType.includes('text/html')) {
          const baseTag = `<base href="${parsedUrl.origin}/">`;
          if (processedHtml.includes('<head>')) {
            processedHtml = processedHtml.replace('<head>', `<head>${baseTag}${INJECTED_DOM_SCRIPT}`);
          } else if (processedHtml.includes('<HEAD>')) {
            processedHtml = processedHtml.replace('<HEAD>', `<HEAD>${baseTag}${INJECTED_DOM_SCRIPT}`);
          } else {
            processedHtml = `${baseTag}${INJECTED_DOM_SCRIPT}${processedHtml}`;
          }
        }

        res.json({
          success: true,
          statusCode: proxyRes.statusCode || 200,
          statusMessage: proxyRes.statusMessage,
          latencyMs: duration,
          url: parsedUrl.toString(),
          resolvedUrl: parsedUrl.toString(),
          contentType,
          headersSent: requestHeaders,
          headersReceived: proxyRes.headers,
          content: processedHtml
        });
      });

      stream.on('error', (err) => {
        res.status(502).json({ success: false, error: err.message });
      });
    });

    proxyReq.on('error', (err) => {
      res.status(502).json({ success: false, error: err.message });
    });

    proxyReq.end();
  });

  // API 2: Live Proxy Stream with Injected DOM Interceptor (for iframe & browser viewport)
  app.get('/proxy-stream', (req, res) => {
    const rawInput = (req.query.url as string) || (req.query.q as string);
    if (!rawInput) return res.status(400).send('URL or Query required');

    const resolvedUrl = resolveTargetUrl(rawInput, 'google');
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(resolvedUrl);
    } catch {
      return res.status(400).send('Invalid URL format');
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestHeaders = {
      ...CHROME_HEADERS,
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
      // Remove embedding block headers
      const responseHeaders = { ...proxyRes.headers };
      delete responseHeaders['x-frame-options'];
      delete responseHeaders['content-security-policy'];
      delete responseHeaders['content-security-policy-report-only'];

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
          
          if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>${baseTag}${INJECTED_DOM_SCRIPT}`);
          } else if (html.includes('<HEAD>')) {
            html = html.replace('<HEAD>', `<HEAD>${baseTag}${INJECTED_DOM_SCRIPT}`);
          } else {
            html = `${baseTag}${INJECTED_DOM_SCRIPT}${html}`;
          }

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
