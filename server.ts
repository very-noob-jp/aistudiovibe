import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import zlib from 'zlib';
import { execFile } from 'child_process';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCommandLineArgs(cmdStr: string): string[] {
  const args: string[] = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match;
  while ((match = regex.exec(cmdStr)) !== null) {
    if (match[1] !== undefined) {
      args.push(match[1]);
    } else if (match[2] !== undefined) {
      args.push(match[2]);
    } else {
      args.push(match[0]);
    }
  }
  return args;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const GOOGLE_BYPASS_COOKIE = 'SOCS=CAISNQgDEitnd3NfMjAyNDA5MjktMF9SQzIaAmphIAEaBgiA_OywBgqPARIHbGl2ZV91aQ; CONSENT=PENDING+999; AEC=AUEFqZc; 1P_JAR=2024-09-29-00';

  const CHROME_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  };

  function resolveTargetUrl(input: string, searchEngine = 'ddg'): string {
    const trimmed = (input || '').trim();
    if (!trimmed) {
      return searchEngine === 'google' ? 'https://www.google.com/?hl=ja' : 'https://html.duckduckgo.com/html/';
    }

    const isUrl = /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/i.test(trimmed) && !trimmed.includes(' ');
    if (isUrl) {
      return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
    }

    if (searchEngine === 'ddg') {
      return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}&kl=jp-jp`;
    }
    if (searchEngine === 'yahoo') {
      return `https://search.yahoo.co.jp/search?p=${encodeURIComponent(trimmed)}`;
    }
    if (searchEngine === 'bing') {
      return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}&setlang=ja`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}&hl=ja&gl=jp`;
  }

  const INJECTED_DOM_SCRIPT = `
  <script>
    (function() {
      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            type: 'RASPI_PROXY_NAVIGATED',
            url: window.location.href,
            title: document.title
          }, '*');
        } catch(e) {}
      }

      document.addEventListener('click', function(e) {
        var target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }
        if (target && target.href && !target.href.startsWith('javascript:') && !target.href.startsWith('#')) {
          var href = target.href;
          if (href.indexOf('google.com/url?') !== -1 || href.indexOf('/url?q=') !== -1) {
            try {
              var u = new URL(href);
              var actual = u.searchParams.get('q') || u.searchParams.get('url');
              if (actual) href = actual;
            } catch(err) {}
          } else if (href.indexOf('duckduckgo.com/l/?uddg=') !== -1) {
            try {
              href = decodeURIComponent(new URL(href).searchParams.get('uddg')) || href;
            } catch(err) {}
          }
          e.preventDefault();
          e.stopPropagation();
          window.location.href = '/proxy-stream?url=' + encodeURIComponent(href);
        }
      }, true);

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

  // API 1: Direct cURL Execution Engine via execFile (No shell injection risk, supports full query params with &)
  app.post('/api/curl/exec', (req, res) => {
    let { command, url } = req.body;
    
    let rawCommand = typeof command === 'string' && command.trim() ? command.trim() : `curl -sSL "${url || 'https://ipinfo.io/json'}"`;

    const tokens = parseCommandLineArgs(rawCommand);
    if (tokens.length === 0 || tokens[0] !== 'curl') {
      return res.status(400).json({ success: false, stderr: 'Command must start with curl' });
    }

    const curlArgs = tokens.slice(1);
    const startTime = Date.now();

    execFile('curl', curlArgs, { timeout: 15000, maxBuffer: 4 * 1024 * 1024 }, (error, stdout, stderr) => {
      const duration = Date.now() - startTime;
      res.json({
        success: !error,
        stdout: stdout || '',
        stderr: stderr || (error ? error.message : ''),
        exitCode: error ? (error.code || 1) : 0,
        latencyMs: duration,
        commandRun: rawCommand,
        url
      });
    });
  });

  // API 2: Streaming Browser Proxy
  function streamProxyRequest(req: express.Request, res: express.Response, targetUrl: string, redirectCount = 0) {
    if (redirectCount > 5) {
      return res.status(508).send('Too many redirects');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return res.status(400).send('Invalid URL format');
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestHeaders: Record<string, string> = {
      ...CHROME_HEADERS,
      'Host': parsedUrl.host
    };

    if (parsedUrl.hostname.includes('google.')) {
      requestHeaders['Cookie'] = GOOGLE_BYPASS_COOKIE;
    }

    const proxyReq = client.request({
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: requestHeaders,
      rejectUnauthorized: false,
      timeout: 15000
    }, (proxyRes) => {
      if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        let redirectUrl = proxyRes.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, parsedUrl.origin).toString();
        }
        return streamProxyRequest(req, res, redirectUrl, redirectCount + 1);
      }

      const responseHeaders = { ...proxyRes.headers };
      delete responseHeaders['x-frame-options'];
      delete responseHeaders['content-security-policy'];
      delete responseHeaders['content-security-policy-report-only'];

      const contentType = proxyRes.headers['content-type'] || '';
      const isHtml = contentType.includes('text/html');

      if (isHtml) {
        const encoding = proxyRes.headers['content-encoding'];
        let decompressor: NodeJS.ReadableStream | null = null;

        if (encoding === 'gzip') decompressor = proxyRes.pipe(zlib.createGunzip());
        else if (encoding === 'deflate') decompressor = proxyRes.pipe(zlib.createInflate());
        else if (encoding === 'br') decompressor = proxyRes.pipe(zlib.createBrotliDecompress());

        const stream = decompressor || proxyRes;
        const chunks: Buffer[] = [];

        stream.on('data', (c: Buffer) => chunks.push(c));
        stream.on('end', () => {
          let html = Buffer.concat(chunks).toString('utf-8');

          if (html.includes('通常と異なるトラフィック') || html.includes('unusual traffic') || html.includes('recaptcha')) {
            const queryTerm = parsedUrl.searchParams.get('q') || '';
            const fallbackHtml = `
            <!DOCTYPE html>
            <html lang="ja">
            <head><meta charset="UTF-8"><title>Google CAPTCHA 回避案内</title>
            <style>body{background:#0f172a;color:#f8fafc;font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;padding:20px;box-sizing:border-box;}.card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:30px;max-width:540px;width:100%;text-align:center;}h2{color:#f87171;margin-top:0;}p{color:#94a3b8;font-size:14px;line-height:1.6;}.btn{display:inline-block;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;margin:8px 4px;}.btn-ddg{background:#e11d48;color:#fff;}.btn-yahoo{background:#2563eb;color:#fff;}</style>
            </head>
            <body>
              <div class="card">
                <h2>⚠️ Google側のBot保護（通常と異なるトラフィック）</h2>
                <p>Googleはプロキシ経由の大量検索を検知するとCAPTCHAを出します。<br><strong>DuckDuckGo</strong> または <strong>Yahoo!</strong> であれば、CAPTCHAゼロで確実に検索結果を取得できます。</p>
                <div style="margin-top:20px;">
                  <a class="btn btn-ddg" href="/proxy-stream?engine=ddg&q=${encodeURIComponent(queryTerm)}">🦆 DuckDuckGoで開く (推奨・高速)</a>
                  <a class="btn btn-yahoo" href="/proxy-stream?engine=yahoo&q=${encodeURIComponent(queryTerm)}">🇯🇵 Yahoo! JAPANで開く</a>
                </div>
              </div>
            </body>
            </html>
            `;
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(fallbackHtml);
          }

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
          responseHeaders['content-type'] = 'text/html; charset=utf-8';

          res.writeHead(proxyRes.statusCode || 200, responseHeaders);
          res.end(html);
        });

        stream.on('error', (err) => {
          if (!res.headersSent) {
            res.status(502).send(`Decompression error: ${err.message}`);
          }
        });
      } else {
        res.writeHead(proxyRes.statusCode || 200, responseHeaders);
        proxyRes.pipe(res);
      }
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).send('504 Gateway Timeout: Target did not respond in 15 seconds.');
      }
    });

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.status(502).send(`Bypass Connection Error: ${err.message}`);
      }
    });

    proxyReq.end();
  }

  app.get('/proxy.pac', (req, res) => {
    const hostHeader = req.headers.host || `127.0.0.1:${PORT}`;
    res.setHeader('Content-Type', 'application/x-ns-proxy-autoconfig');
    res.send(`function FindProxyForURL(url, host) {
      if (shExpMatch(host, "localhost") || shExpMatch(host, "127.0.0.1") || shExpMatch(host, "192.168.*") || shExpMatch(host, "10.*")) {
        return "DIRECT";
      }
      return "PROXY ${hostHeader}; DIRECT";
    }`);
  });

  app.get('/proxy-stream', (req, res) => {
    const rawInput = (req.query.url as string) || (req.query.q as string);
    const engine = (req.query.engine as string) || 'ddg';
    if (!rawInput) return res.status(400).send('URL or Query parameter required');
    streamProxyRequest(req, res, resolveTargetUrl(rawInput, engine));
  });

  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

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

  const httpServer = http.createServer(app);

  // OS Forward Proxy: HTTP CONNECT Tunnel
  httpServer.on('connect', (req, clientSocket, head) => {
    const [targetHost, targetPortStr] = (req.url || '').split(':');
    const targetPort = parseInt(targetPortStr) || 443;

    const serverSocket = net.connect(targetPort, targetHost, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', () => { clientSocket.end(); });
    clientSocket.on('error', () => { serverSocket.end(); });
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 RasPi Web Proxy & Wi-Fi Forward Tunnel Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
