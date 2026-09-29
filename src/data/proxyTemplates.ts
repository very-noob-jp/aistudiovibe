import { ProxyConfig } from '../types/proxy';

export function generateNodeServerCode(config: ProxyConfig): string {
  const { port, enableAuth, username, password, stripReferer, antiBotEngine } = config;

  if (antiBotEngine === 'puppeteer_chromium') {
    return `/**
 * Raspberry Pi 4B - Real Chromium Anti-Bot Bypass Web Proxy
 * Uses Raspberry Pi's native Chromium to execute JavaScript & Google Search
 * 
 * Install on Raspberry Pi:
 *   sudo apt update && sudo apt install -y chromium-browser
 *   npm install express puppeteer-core
 */
import express from 'express';
import puppeteer from 'puppeteer-core';
import { URL } from 'node:url';

const app = express();
const PORT = process.env.PORT || ${port};

// Helper to handle search keywords or URLs
function resolveTargetUrl(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return 'https://www.google.com';
  const isUrl = /^(https?:\\/\\/|[a-zA-Z0-9-]+\\.[a-zA-Z]{2,})(\\/.*)?$/i.test(trimmed) && !trimmed.includes(' ');
  if (isUrl) return trimmed.startsWith('http') ? trimmed : 'https://' + trimmed;
  return 'https://www.google.com/search?q=' + encodeURIComponent(trimmed) + '&hl=ja&gl=jp';
}

${enableAuth ? `
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.setHeader('WWW-Authenticate', 'Basic realm="RasPi Proxy"');
    return res.status(401).send('401 認証が必要です');
  }
  const [user, pass] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
  if (user === '${username}' && pass === '${password}') return next();
  return res.status(403).send('403 認証失敗');
});
` : ''}

let browser = null;
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--lang=ja,en-US']
    });
  }
  return browser;
}

app.get('/proxy-stream', async (req, res) => {
  const rawInput = req.query.url || req.query.q;
  if (!rawInput) return res.status(400).send('Error: Missing url parameter');

  const target = resolveTargetUrl(rawInput);
  try {
    const b = await getBrowser();
    const page = await b.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 30000 });

    // Inject DOM link and form interceptor
    await page.evaluate((baseOrigin) => {
      let base = document.querySelector('base');
      if (!base) {
        base = document.createElement('base');
        document.head.prepend(base);
      }
      base.href = baseOrigin + '/';

      document.addEventListener('click', (e) => {
        let t = e.target;
        while (t && t.tagName !== 'A') t = t.parentElement;
        if (t && t.href && !t.href.startsWith('javascript:')) {
          e.preventDefault();
          window.location.href = '/proxy-stream?url=' + encodeURIComponent(t.href);
        }
      }, true);
    }, new URL(target).origin);

    const content = await page.content();
    await page.close();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(content);
  } catch (err) {
    res.status(502).send('Proxy Error: ' + err.message);
  }
});

app.get('/', (req, res) => {
  res.send(\`<!DOCTYPE html><html><head><meta charset="utf-8"><title>RasPi Proxy</title><style>body{background:#0f172a;color:#fff;font-family:sans-serif;display:flex;justify-content:center;padding:50px;}input{padding:12px;width:350px;border-radius:8px;border:1px solid #334155;background:#090d16;color:#fff;}button{padding:12px 20px;background:#e11d48;color:#fff;border:none;border-radius:8px;font-weight:bold;margin-left:8px;cursor:pointer;}</style></head><body><div><h2>🍓 RasPi 4B Google検索 & バイパス</h2><form onsubmit="event.preventDefault(); location.href='/proxy-stream?q=' + encodeURIComponent(document.getElementById('q').value)"><input id="q" placeholder="Google検索またはURL入力..." required /><button type="submit">検索</button></form></div></body></html>\`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🍓 RasPi 4B Chromium Proxy running on http://0.0.0.0:\${PORT}\`);
});
`;
  }

  return `/**
 * Raspberry Pi 4B - High-Speed Anti-Bot & Google Search DOM Web Proxy
 * Node.js (v18+) Built-in Express/HTTP Proxy Engine
 */
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import { URL } from 'node:url';

const PORT = process.env.PORT || ${port};
const AUTH_ENABLED = ${enableAuth};
const USERNAME = process.env.PROXY_USER || '${username || 'admin'}';
const PASSWORD = process.env.PROXY_PASS || '${password || 'raspi2024'}';

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
  'Upgrade-Insecure-Requests': '1'
};

function resolveTargetUrl(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return 'https://www.google.com';
  const isUrl = /^(https?:\\/\\/|[a-zA-Z0-9-]+\\.[a-zA-Z]{2,})(\\/.*)?$/i.test(trimmed) && !trimmed.includes(' ');
  if (isUrl) return trimmed.startsWith('http') ? trimmed : 'https://' + trimmed;
  return 'https://www.google.com/search?q=' + encodeURIComponent(trimmed) + '&hl=ja&gl=jp';
}

const DOM_INTERCEPTOR = \`
<script>
  (function() {
    // Intercept <a> links
    document.addEventListener('click', function(e) {
      var t = e.target;
      while (t && t.tagName !== 'A') t = t.parentElement;
      if (t && t.href && !t.href.startsWith('javascript:')) {
        var h = t.href;
        if (h.indexOf('/url?q=') !== -1) {
          try { h = new URL(h).searchParams.get('q') || h; } catch(err){}
        }
        e.preventDefault();
        window.location.href = '/proxy-stream?url=' + encodeURIComponent(h);
      }
    }, true);

    // Intercept <form> submits (Google search box)
    document.addEventListener('submit', function(e) {
      var f = e.target;
      if (f && f.action) {
        e.preventDefault();
        var fd = new FormData(f);
        var p = new URLSearchParams();
        fd.forEach(function(v, k) { p.append(k, v); });
        var target = f.action + (f.action.indexOf('?') === -1 ? '?' : '&') + p.toString();
        window.location.href = '/proxy-stream?url=' + encodeURIComponent(target);
      }
    }, true);
  })();
</script>
\`;

function checkAuth(req, res) {
  if (!AUTH_ENABLED) return true;
  const auth = req.headers['authorization'];
  if (!auth) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="RasPi Proxy"', 'Content-Type': 'text/plain' });
    res.end('401 Authentication Required');
    return false;
  }
  const [u, p] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
  if (u === USERNAME && p === PASSWORD) return true;
  res.writeHead(403, { 'Content-Type': 'text/plain' });
  res.end('403 Forbidden');
  return false;
}

function handleProxy(req, res, targetUrl) {
  let parsed;
  try { parsed = new URL(targetUrl); } catch(e) {
    res.writeHead(400); res.end('Invalid URL'); return;
  }

  const isHttps = parsed.protocol === 'https:';
  const client = isHttps ? https : http;

  const headers = { ...CHROME_HEADERS, 'Host': parsed.host };
  ${stripReferer ? `delete headers['Referer'];` : ''}

  const reqOptions = {
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port || (isHttps ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: 'GET',
    headers: headers,
    rejectUnauthorized: false
  };

  const proxyReq = client.request(reqOptions, (proxyRes) => {
    const respHeaders = { ...proxyRes.headers };
    delete respHeaders['x-frame-options'];
    delete respHeaders['content-security-policy'];

    const encoding = proxyRes.headers['content-encoding'];
    let stream = proxyRes;
    if (encoding === 'gzip') stream = proxyRes.pipe(zlib.createGunzip());
    else if (encoding === 'deflate') stream = proxyRes.pipe(zlib.createInflate());
    else if (encoding === 'br') stream = proxyRes.pipe(zlib.createBrotliDecompress());

    const isHtml = (proxyRes.headers['content-type'] || '').includes('text/html');
    if (isHtml) {
      const chunks = [];
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => {
        let html = Buffer.concat(chunks).toString('utf-8');
        const base = '<base href="' + parsed.origin + '/">';
        if (html.includes('<head>')) html = html.replace('<head>', '<head>' + base + DOM_INTERCEPTOR);
        else html = base + DOM_INTERCEPTOR + html;

        delete respHeaders['content-encoding'];
        delete respHeaders['content-length'];
        res.writeHead(proxyRes.statusCode || 200, respHeaders);
        res.end(html);
      });
    } else {
      delete respHeaders['content-encoding'];
      res.writeHead(proxyRes.statusCode || 200, respHeaders);
      stream.pipe(res);
    }
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy Error: ' + err.message);
  });

  proxyReq.end();
}

const server = http.createServer((req, res) => {
  if (!checkAuth(req, res)) return;

  const reqUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  if (reqUrl.pathname === '/proxy-stream') {
    const raw = reqUrl.searchParams.get('url') || reqUrl.searchParams.get('q');
    handleProxy(req, res, resolveTargetUrl(raw));
  } else {
    // Simple Clean Client Portal UI
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(\`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RasPi 4B Web Browser</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .box { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 30px; max-width: 580px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; margin-bottom: 8px; font-weight: 700; color: #fff; }
    p { color: #94a3b8; font-size: 13px; margin-bottom: 20px; line-height: 1.5; }
    .search-row { display: flex; gap: 8px; }
    input { flex: 1; padding: 12px 16px; border-radius: 10px; border: 1px solid #475569; background: #090d16; color: #fff; font-size: 14px; outline: none; }
    button { background: #e11d48; color: #fff; border: none; border-radius: 10px; padding: 12px 22px; font-weight: 600; cursor: pointer; font-size: 14px; }
    button:hover { opacity: 0.9; }
    .links { margin-top: 15px; display: flex; flex-wrap: wrap; gap: 6px; }
    .links a { font-size: 12px; color: #38bdf8; background: #0f172a; padding: 6px 12px; border-radius: 6px; text-decoration: none; border: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="box">
    <h1>🍓 Raspberry Pi 4B Web ブラウザ</h1>
    <p>Google検索キーワード、またはURLを入力してください。Raspberry Piが代理で検索・取得し、ページ内のリンククリックも自動中継します。</p>
    <form onsubmit="event.preventDefault(); location.href='/proxy-stream?q=' + encodeURIComponent(document.getElementById('q').value)">
      <div class="search-row">
        <input id="q" type="text" placeholder="Google検索、または https://..." autofocus required />
        <button type="submit">開く</button>
      </div>
    </form>
    <div class="links">
      <a href="/proxy-stream?q=Google">Google 検索</a>
      <a href="/proxy-stream?url=https://ja.wikipedia.org">Wikipedia 日本語</a>
      <a href="/proxy-stream?url=https://m.yahoo.co.jp">Yahoo! JAPAN</a>
      <a href="/proxy-stream?url=https://httpbin.org/ip">IP確認</a>
    </div>
  </div>
</body>
</html>\`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(\`🍓 RasPi 4B Web Proxy running on http://0.0.0.0:\${PORT}\`);
});
`;
}

export function generatePackageJson(config: ProxyConfig): string {
  const { antiBotEngine } = config;
  const isPuppeteer = antiBotEngine === 'puppeteer_chromium';

  return JSON.stringify({
    name: 'raspi-https-bypass-proxy',
    version: '1.0.0',
    description: 'Raspberry Pi 4B HTTPS Web Proxy with Google Search & DOM link interception',
    main: 'server.mjs',
    type: 'module',
    scripts: {
      dev: 'node server.mjs',
      start: 'node server.mjs',
      tunnel: `cloudflared tunnel --url http://localhost:${config.port}`
    },
    dependencies: isPuppeteer ? {
      express: '^4.21.2',
      'puppeteer-core': '^22.0.0'
    } : {}
  }, null, 2);
}

export function generateSetupBashScript(config: ProxyConfig): string {
  const { sslMode, port, antiBotEngine, autoStartService } = config;
  const isPuppeteer = antiBotEngine === 'puppeteer_chromium';

  return `#!/usr/bin/env bash
# ==============================================================================
# 🍓 Raspberry Pi 4B - Google検索 & DOM自動中継 HTTPS Web Proxy
# ==============================================================================
set -e

echo "🍓 [1/4] Raspberry Pi システムパッケージを更新中..."
sudo apt-get update -y
sudo apt-get install -y curl wget git ufw

${isPuppeteer ? `
echo "🌐 Chromium ブラウザ (Raspberry Pi ARM64版) をインストール中..."
sudo apt-get install -y chromium-browser libnss3 libatk-bridge2.0-0 libgtk-3-0
` : ''}

echo "📦 [2/4] Node.js 20 LTS & npm を確認・インストール中..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
node -v
npm -v

echo "📂 [3/4] プロジェクト作成 & ファイル配置..."
APP_DIR="$HOME/raspi-web-proxy"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

cat << 'EOF' > package.json
${generatePackageJson(config)}
EOF

cat << 'EOF' > server.mjs
${generateNodeServerCode(config)}
EOF

${isPuppeteer ? `npm install express puppeteer-core` : `echo "✅ 標準Node.jsモジュールのみ使用"`}

${sslMode === 'cloudflare_tunnel' ? `
echo "🚀 Cloudflare Tunnel (cloudflared ARM64) を導入中..."
if ! command -v cloudflared &> /dev/null; then
  curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
  sudo dpkg -i cloudflared.deb
  rm cloudflared.deb
fi
` : ''}

echo "🛡️ [4/4] ポート ${port} の開放..."
sudo ufw allow ${port}/tcp || true

${autoStartService ? `
cat << EOF | sudo tee /etc/systemd/system/raspi-proxy.service
[Unit]
Description=RasPi 4B Web Proxy
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=$(which npm) start
Restart=always
RestartSec=5
Environment=PORT=${port}

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable raspi-proxy
sudo systemctl restart raspi-proxy
echo "✅ 常時稼働サービスを開始しました！"
` : `
echo "💡 起動コマンド:"
echo "   cd $APP_DIR && npm start"
`}

LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "=============================================================================="
echo "🎉 準備完了！"
echo "🌐 ブラウザでアクセス: http://$LOCAL_IP:${port}"
${sslMode === 'cloudflare_tunnel' ? `echo "🔒 世界中からHTTPS公開: npm run tunnel"` : ''}
echo "=============================================================================="
`;
}
