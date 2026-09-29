import { ProxyConfig } from '../types/proxy';

export function generateNodeServerCode(config: ProxyConfig): string {
  const { port, enableAuth, username, password, stripReferer, antiBotEngine, browserProfile } = config;

  if (antiBotEngine === 'puppeteer_chromium') {
    return `/**
 * Raspberry Pi 4B - Real Chromium Anti-Bot Bypass Web Proxy
 * Uses Raspberry Pi's native Chromium to execute JavaScript & bypass Cloudflare/Bot checks
 * 
 * Install requirements on Raspberry Pi:
 *   sudo apt update && sudo apt install -y chromium-browser
 *   npm install express puppeteer-core
 */
import express from 'express';
import puppeteer from 'puppeteer-core';
import { URL } from 'node:url';

const app = express();
const PORT = process.env.PORT || ${port};

// Basic Auth Middleware
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
      executablePath: '/usr/bin/chromium-browser', // RasPi OS standard path
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--lang=ja,en-US'
      ]
    });
  }
  return browser;
}

// Bypass endpoint
app.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Error: Missing url parameter');

  try {
    const b = await getBrowser();
    const page = await b.newPage();
    
    // Set realistic browser viewport & headers
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      'Sec-CH-UA': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"'
    });

    // Navigate and wait for DOM / anti-bot scripts to finish
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Inject <base> tag so styles/images render correctly
    await page.evaluate((baseOrigin) => {
      let base = document.querySelector('base');
      if (!base) {
        base = document.createElement('base');
        document.head.prepend(base);
      }
      base.href = baseOrigin + '/';
    }, new URL(target).origin);

    const content = await page.content();
    await page.close();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(content);
  } catch (err) {
    res.status(502).send('Proxy Chromium Error: ' + err.message);
  }
});

// Portal UI
app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html lang="ja">
    <head><meta charset="UTF-8"><title>RasPi 4B Anti-Bot Web Proxy</title></head>
    <body style="font-family:sans-serif;background:#0f172a;color:#fff;padding:2rem;display:flex;justify-content:center;">
      <div style="background:#1e293b;padding:2rem;border-radius:12px;max-width:500px;width:100%;">
        <h2>🍓 Raspberry Pi 4B Anti-Bot Bypass Proxy</h2>
        <p style="color:#94a3b8;font-size:14px;margin:10px 0 20px;">本物のChromiumブラウザエンジンでJavaScript・Bot判定を突破して中継します。</p>
        <form onsubmit="event.preventDefault(); location.href='/proxy?url=' + encodeURIComponent(document.getElementById('u').value)">
          <input id="u" type="text" placeholder="https://..." style="width:100%;padding:10px;border-radius:6px;border:1px solid #475569;background:#090d16;color:#fff;margin-bottom:10px;" required />
          <button type="submit" style="width:100%;padding:10px;background:#e11d48;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">バイパス閲覧を開く</button>
        </form>
      </div>
    </body>
    </html>
  \`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🍓 RasPi 4B Anti-Bot Proxy running on http://0.0.0.0:\${PORT}\`);
});
`;
  }

  return `/**
 * Raspberry Pi 4B - High-Speed Anti-Bot Header Synthesis Web Proxy
 * Standalone Node.js (v18+) with Sec-CH-UA / Sec-Fetch / TLS header spoofing
 */
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { URL } from 'node:url';

const PORT = process.env.PORT || ${port};
const AUTH_ENABLED = ${enableAuth};
const USERNAME = process.env.PROXY_USER || '${username || 'admin'}';
const PASSWORD = process.env.PROXY_PASS || '${password || 'raspi2024'}';

// Comprehensive Browser Identity Headers (Prevents Bot Classification)
const REAL_BROWSER_HEADERS = {
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

function checkAuth(req, res) {
  if (!AUTH_ENABLED) return true;
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.writeHead(401, {
      'WWW-Authenticate': 'Basic realm="Raspberry Pi Proxy Access"',
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end('<h1>401 認証が必要です</h1>');
    return false;
  }
  const [scheme, credentials] = authHeader.split(' ');
  if (scheme !== 'Basic' || !credentials) {
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Invalid Auth Scheme');
    return false;
  }
  const [user, pass] = Buffer.from(credentials, 'base64').toString().split(':');
  if (user === USERNAME && pass === PASSWORD) return true;
  res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>403 認証失敗</h1>');
  return false;
}

function handleProxyRequest(req, res) {
  const reqUrl = new URL(req.url, \`http://\${req.headers.host || 'localhost'}\`);
  const rawTarget = reqUrl.searchParams.get('url');

  if (!rawTarget) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Error: Missing "url" parameter. Example: /proxy?url=https://example.com');
    return;
  }

  let targetParsed;
  try {
    targetParsed = new URL(rawTarget.startsWith('http') ? rawTarget : 'https://' + rawTarget);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Error: Invalid URL.');
    return;
  }

  const isHttps = targetParsed.protocol === 'https:';
  const client = isHttps ? https : http;

  // Synthesize realistic browser request headers (Bypasses bot checks)
  const forwardedHeaders = {
    ...REAL_BROWSER_HEADERS,
    'Host': targetParsed.host
  };

  ${stripReferer ? `delete forwardedHeaders['Referer'];` : ''}

  const options = {
    protocol: targetParsed.protocol,
    hostname: targetParsed.hostname,
    port: targetParsed.port || (isHttps ? 443 : 80),
    path: targetParsed.pathname + targetParsed.search,
    method: req.method,
    headers: forwardedHeaders,
    rejectUnauthorized: false
  };

  const proxyReq = client.request(options, (proxyRes) => {
    const responseHeaders = { ...proxyRes.headers };
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['content-security-policy'];

    const encoding = proxyRes.headers['content-encoding'];
    let stream = proxyRes;

    if (encoding === 'gzip') stream = proxyRes.pipe(zlib.createGunzip());
    else if (encoding === 'deflate') stream = proxyRes.pipe(zlib.createInflate());
    else if (encoding === 'br') stream = proxyRes.pipe(zlib.createBrotliDecompress());

    const contentType = proxyRes.headers['content-type'] || '';
    const isHtml = contentType.includes('text/html');

    if (isHtml) {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        let rawHtml = Buffer.concat(chunks).toString('utf-8');
        const baseUrl = targetParsed.origin;
        
        // Inject <base> tag to preserve images, css, links
        if (rawHtml.includes('<head>')) {
          rawHtml = rawHtml.replace('<head>', \`<head><base href="\${baseUrl}/">\`);
        } else if (rawHtml.includes('<HEAD>')) {
          rawHtml = rawHtml.replace('<HEAD>', \`<HEAD><base href="\${baseUrl}/">\`);
        }

        // Injected floating RasPi badge
        const badge = \`
        <div style="position:fixed;bottom:10px;right:10px;background:#0f172a;color:#f8fafc;padding:6px 12px;border-radius:20px;font-family:sans-serif;font-size:11px;z-index:999999;border:1px solid #334155;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
          🍓 Proxied by RasPi 4B: <strong>\${targetParsed.hostname}</strong>
          <a href="/" style="color:#38bdf8;margin-left:6px;text-decoration:none;">[ポータル]</a>
        </div>
        \`;
        rawHtml = rawHtml.replace('</body>', \`\${badge}</body>\`);

        delete responseHeaders['content-encoding'];
        delete responseHeaders['content-length'];
        res.writeHead(proxyRes.statusCode || 200, responseHeaders);
        res.end(rawHtml);
      });
    } else {
      delete responseHeaders['content-encoding'];
      res.writeHead(proxyRes.statusCode || 200, responseHeaders);
      stream.pipe(res);
    }
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(\`<div style="font-family:sans-serif;padding:2rem;background:#0f172a;color:#fff;"><h2>⚠️ 502 Bad Gateway</h2><p>\${err.message}</p></div>\`);
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (!checkAuth(req, res)) return;

  const reqUrl = new URL(req.url, \`http://\${req.headers.host || 'localhost'}\`);
  if (reqUrl.pathname === '/' || reqUrl.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(\`
      <!DOCTYPE html>
      <html lang="ja">
      <head><meta charset="UTF-8"><title>RasPi 4B Web Proxy</title></head>
      <body style="font-family:sans-serif;background:#0f172a;color:#fff;padding:2rem;display:flex;justify-content:center;">
        <div style="background:#1e293b;padding:2.5rem;border-radius:16px;max-width:540px;width:100%;">
          <h2>🍓 Raspberry Pi 4B Web Proxy</h2>
          <p style="color:#94a3b8;font-size:14px;margin:8px 0 20px;">Sec-CH-UAおよびブラウザ偽装ヘッダーにより、Bot判定を回避して中継します。</p>
          <form onsubmit="event.preventDefault(); location.href='/proxy?url=' + encodeURIComponent(document.getElementById('u').value)">
            <input id="u" type="text" placeholder="https://example.com または ja.wikipedia.org" style="width:100%;padding:12px;border-radius:8px;border:1px solid #475569;background:#090d16;color:#fff;box-sizing:border-box;margin-bottom:12px;" required />
            <button type="submit" style="width:100%;padding:12px;background:#e11d48;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer;font-size:15px;">RasPi経由で開く</button>
          </form>
        </div>
      </body>
      </html>
    \`);
  } else if (reqUrl.pathname === '/proxy') {
    handleProxyRequest(req, res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(\`🍓 RasPi Web Proxy running on http://0.0.0.0:\${PORT}\`);
});
`;
}

export function generatePackageJson(config: ProxyConfig): string {
  const { antiBotEngine } = config;
  const isPuppeteer = antiBotEngine === 'puppeteer_chromium';

  return JSON.stringify({
    name: 'raspi-https-bypass-proxy',
    version: '1.0.0',
    description: 'Raspberry Pi 4B HTTPS Web Proxy with Anti-Bot Browser Emulation',
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
# 🍓 Raspberry Pi 4B - npm対応 HTTPS & Anti-Bot Web Proxy 全自動セットアップ
# ==============================================================================
set -e

echo "🍓 [1/4] Raspberry Pi システム更新 & 必要なパッケージをインストール中..."
sudo apt-get update -y
sudo apt-get install -y curl wget git ufw

${isPuppeteer ? `
# Real Chromium インストール (JavaScript実行 & Bot判定突破用)
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

echo "📂 [3/4] プロジェクト作成 & npm 初期化..."
APP_DIR="$HOME/raspi-web-proxy"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# package.json を作成
cat << 'EOF' > package.json
${generatePackageJson(config)}
EOF

# server.mjs を作成
cat << 'EOF' > server.mjs
${generateNodeServerCode(config)}
EOF

# npm dependencies インストール
${isPuppeteer ? `npm install express puppeteer-core` : `echo "✅ 標準Node.jsモジュールのみ使用（依存パッケージゼロで超軽量稼働）"`}

${sslMode === 'cloudflare_tunnel' ? `
# Cloudflare Tunnel のセットアップ (ドメイン不要・ルーター設定不要)
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
# systemd サービス登録 (常時稼働)
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
echo "✅ npm start で常時バックグラウンド稼働を開始しました！"
` : `
echo "💡 起動方法:"
echo "   cd $APP_DIR && npm start"
`}

LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "=============================================================================="
echo "🎉 準備完了！"
echo "🌐 ローカルアクセス: http://$LOCAL_IP:${port}"
${sslMode === 'cloudflare_tunnel' ? `echo "🔒 世界中からHTTPS公開: npm run tunnel"` : ''}
echo "=============================================================================="
`;
}
