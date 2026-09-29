import { ProxyConfig } from '../types/proxy';

export function generateNodeServerCode(config: ProxyConfig): string {
  const { port, enableAuth, username, password, stripReferer } = config;

  return `/**
 * Raspberry Pi 4B - Dual Mode Web Proxy & cURL Terminal Engine
 * Node.js (v18+) Native HTTP + Direct execFile cURL
 */
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import { URL } from 'node:url';
import { execFile } from 'node:child_process';
import net from 'node:net';

const PORT = process.env.PORT || ${port};
const AUTH_ENABLED = ${enableAuth};
const USERNAME = process.env.PROXY_USER || '${username || 'admin'}';
const PASSWORD = process.env.PROXY_PASS || '${password || 'raspi2024'}';

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
  'Sec-Fetch-User': '?1'
};

function parseCommandLineArgs(cmdStr) {
  const args = [];
  const regex = /[^\\s"']+|"([^"]*)"|'([^']*)'/g;
  let match;
  while ((match = regex.exec(cmdStr)) !== null) {
    if (match[1] !== undefined) args.push(match[1]);
    else if (match[2] !== undefined) args.push(match[2]);
    else args.push(match[0]);
  }
  return args;
}

function resolveTargetUrl(input, engine = 'ddg') {
  const trimmed = (input || '').trim();
  if (!trimmed) return engine === 'google' ? 'https://www.google.com/?hl=ja' : 'https://html.duckduckgo.com/html/';
  const isUrl = /^(https?:\\/\\/|[a-zA-Z0-9-]+\\.[a-zA-Z]{2,})(\\/.*)?$/i.test(trimmed) && !trimmed.includes(' ');
  if (isUrl) return trimmed.startsWith('http') ? trimmed : 'https://' + trimmed;
  if (engine === 'ddg') return 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(trimmed) + '&kl=jp-jp';
  if (engine === 'yahoo') return 'https://search.yahoo.co.jp/search?p=' + encodeURIComponent(trimmed);
  if (engine === 'bing') return 'https://www.bing.com/search?q=' + encodeURIComponent(trimmed) + '&setlang=ja';
  return 'https://www.google.com/search?q=' + encodeURIComponent(trimmed) + '&hl=ja&gl=jp';
}

const DOM_INTERCEPTOR = \`
<script>
  (function() {
    document.addEventListener('click', function(e) {
      var t = e.target;
      while (t && t.tagName !== 'A') t = t.parentElement;
      if (t && t.href && !t.href.startsWith('javascript:') && !t.href.startsWith('#')) {
        var h = t.href;
        if (h.indexOf('/url?q=') !== -1) {
          try { h = new URL(h).searchParams.get('q') || h; } catch(err){}
        } else if (h.indexOf('duckduckgo.com/l/?uddg=') !== -1) {
          try { h = decodeURIComponent(new URL(h).searchParams.get('uddg')) || h; } catch(err){}
        }
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/proxy-stream?url=' + encodeURIComponent(h);
      }
    }, true);

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

function handleProxy(req, res, targetUrl, redirectCount = 0) {
  if (redirectCount > 5) { res.writeHead(508); res.end('Too many redirects'); return; }
  let parsed;
  try { parsed = new URL(targetUrl); } catch(e) { res.writeHead(400); res.end('Invalid URL'); return; }

  const isHttps = parsed.protocol === 'https:';
  const client = isHttps ? https : http;
  const headers = { ...CHROME_HEADERS, 'Host': parsed.host };
  if (parsed.hostname.includes('google.')) headers['Cookie'] = GOOGLE_BYPASS_COOKIE;

  const reqOptions = {
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port || (isHttps ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: 'GET',
    headers: headers,
    rejectUnauthorized: false,
    timeout: 15000
  };

  const proxyReq = client.request(reqOptions, (proxyRes) => {
    if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
      let redirectUrl = proxyRes.headers.location;
      if (!redirectUrl.startsWith('http')) redirectUrl = new URL(redirectUrl, parsed.origin).toString();
      return handleProxy(req, res, redirectUrl, redirectCount + 1);
    }

    const respHeaders = { ...proxyRes.headers };
    delete respHeaders['x-frame-options'];
    delete respHeaders['content-security-policy'];
    delete respHeaders['content-security-policy-report-only'];

    const contentType = proxyRes.headers['content-type'] || '';
    const isHtml = contentType.includes('text/html');

    if (isHtml) {
      const encoding = proxyRes.headers['content-encoding'];
      let decompressor = null;
      if (encoding === 'gzip') decompressor = zlib.createGunzip();
      else if (encoding === 'deflate') decompressor = zlib.createInflate();
      else if (encoding === 'br') decompressor = zlib.createBrotliDecompress();

      const stream = decompressor ? proxyRes.pipe(decompressor) : proxyRes;
      const chunks = [];
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => {
        let html = Buffer.concat(chunks).toString('utf-8');

        if (html.includes('通常と異なるトラフィック') || html.includes('unusual traffic') || html.includes('recaptcha')) {
          const q = parsed.searchParams.get('q') || '';
          const fallback = \`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>CAPTCHA回避</title><style>body{background:#0f172a;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;padding:20px;box-sizing:border-box;}.box{background:#1e293b;padding:30px;border-radius:16px;max-width:500px;text-align:center;}a{display:inline-block;padding:12px 20px;border-radius:8px;font-weight:bold;text-decoration:none;margin:8px;color:#fff;background:#e11d48;}</style></head><body><div class="box"><h3>⚠️ Google側のBot保護が作動しました</h3><p style="color:#94a3b8;font-size:14px;">DuckDuckGoまたはYahoo!であればCAPTCHAなしで検索結果を取得できます：</p><a href="/proxy-stream?engine=ddg&q=\${encodeURIComponent(q)}">🦆 DuckDuckGoで開く (推奨)</a><a style="background:#2563eb;" href="/proxy-stream?engine=yahoo&q=\${encodeURIComponent(q)}">🇯🇵 Yahoo! JAPANで開く</a></div></body></html>\`;
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end(fallback);
        }

        const baseTag = '<base href="' + parsed.origin + '/">';
        if (html.includes('<head>')) html = html.replace('<head>', '<head>' + baseTag + DOM_INTERCEPTOR);
        else html = baseTag + DOM_INTERCEPTOR + html;

        delete respHeaders['content-encoding'];
        delete respHeaders['content-length'];
        respHeaders['content-type'] = 'text/html; charset=utf-8';
        res.writeHead(proxyRes.statusCode || 200, respHeaders);
        res.end(html);
      });
      stream.on('error', () => { if (!res.headersSent) { res.writeHead(502); res.end('Stream error'); } });
    } else {
      res.writeHead(proxyRes.statusCode || 200, respHeaders);
      proxyRes.pipe(res);
    }
  });

  proxyReq.on('timeout', () => { proxyReq.destroy(); if (!res.headersSent) { res.writeHead(504); res.end('Timeout'); } });
  proxyReq.on('error', (err) => { if (!res.headersSent) { res.writeHead(502); res.end('Error: ' + err.message); } });
  proxyReq.end();
}

function handleCurlApi(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let parsedBody = {};
    try { parsedBody = JSON.parse(body); } catch(e) {}
    
    let rawCommand = (parsedBody.command || '').trim() || 'curl -sSL "https://ipinfo.io/json"';
    const tokens = parseCommandLineArgs(rawCommand);
    if (tokens.length === 0 || tokens[0] !== 'curl') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, stderr: 'Command must start with curl' }));
    }

    const curlArgs = tokens.slice(1);
    const startTime = Date.now();

    execFile('curl', curlArgs, { timeout: 15000, maxBuffer: 4 * 1024 * 1024 }, (error, stdout, stderr) => {
      const duration = Date.now() - startTime;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: !error,
        stdout: stdout || '',
        stderr: stderr || (error ? error.message : ''),
        exitCode: error ? (error.code || 1) : 0,
        latencyMs: duration,
        commandRun: rawCommand
      }));
    });
  });
}

const server = http.createServer((req, res) => {
  if (!checkAuth(req, res)) return;

  const reqUrl = new URL(req.url, 'http://' + (req.headers.host || '127.0.0.1'));
  
  if (reqUrl.pathname === '/api/curl/exec' && req.method === 'POST') {
    handleCurlApi(req, res);
  } else if (reqUrl.pathname === '/proxy.pac') {
    // PAC File for automatic Wi-Fi proxy configuration
    const hostHeader = req.headers.host || '127.0.0.1:' + PORT;
    res.writeHead(200, { 'Content-Type': 'application/x-ns-proxy-autoconfig' });
    res.end(\`function FindProxyForURL(url, host) {
      if (shExpMatch(host, "localhost") || shExpMatch(host, "127.0.0.1") || shExpMatch(host, "192.168.*") || shExpMatch(host, "10.*")) {
        return "DIRECT";
      }
      return "PROXY \${hostHeader}; DIRECT";
    }\`);
  } else if (reqUrl.pathname === '/proxy-stream' || reqUrl.pathname === '/proxy') {
    const raw = reqUrl.searchParams.get('url') || reqUrl.searchParams.get('q');
    const engine = reqUrl.searchParams.get('engine') || 'ddg';
    handleProxy(req, res, resolveTargetUrl(raw, engine));
  } else if (reqUrl.pathname === '/favicon.ico') {
    res.writeHead(204); res.end();
  } else {
    // Portal HTML
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(\`<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>RasPi Browser & cURL</title>
<style>body{background:#0f172a;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;padding:20px;box-sizing:border-box;}.box{background:#1e293b;padding:30px;border-radius:16px;max-width:540px;width:100%;}input{padding:12px;width:60%;border-radius:8px;border:1px solid #475569;background:#090d16;color:#fff;font-size:14px;}select{background:#090d16;color:#fff;padding:12px;border-radius:8px;border:1px solid #475569;}button{padding:12px 18px;background:#e11d48;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer;margin-left:6px;}</style>
</head><body><div class="box"><h2>🍓 RasPi 4B Web ブラウザ & cURL</h2><p style="color:#94a3b8;font-size:13px;">検索キーワードまたはURLを入力してください：</p><form onsubmit="event.preventDefault(); var e=document.getElementById('eng').value; var q=document.getElementById('q').value; location.href='/proxy-stream?engine='+e+'&q='+encodeURIComponent(q)"><select id="eng"><option value="ddg" selected>🦆 DuckDuckGo (推奨)</option><option value="yahoo">🇯🇵 Yahoo!</option><option value="bing">⚡ Bing</option><option value="google">🔍 Google</option></select><input id="q" placeholder="検索..." required /><button type="submit">開く</button></form></div></body></html>\`);
  }
});

// OS-Level Forward Proxy (HTTP CONNECT Tunnel for Wi-Fi Proxy settings)
server.on('connect', (req, clientSocket, head) => {
  if (!checkAuth(req, clientSocket)) return;
  const [targetHost, targetPortStr] = req.url.split(':');
  const targetPort = parseInt(targetPortStr) || 443;

  const serverSocket = net.connect(targetPort, targetHost, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\\r\\n\\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', () => { clientSocket.end(); });
  clientSocket.on('error', () => { serverSocket.end(); });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🍓 RasPi Web Proxy & Wi-Fi Forward Tunnel ready on port ' + PORT);
});
`;
}

export function generatePackageJson(config: ProxyConfig): string {
  return JSON.stringify({
    name: 'raspi-https-bypass-proxy',
    version: '1.0.0',
    description: 'Raspberry Pi 4B HTTPS Web Proxy with Anti-CAPTCHA & cURL Terminal Engine',
    main: 'server.mjs',
    type: 'module',
    scripts: {
      dev: 'node server.mjs',
      start: 'node server.mjs',
      tunnel: `cloudflared tunnel --url http://127.0.0.1:${config.port}`
    },
    dependencies: {}
  }, null, 2);
}

export function generateSetupBashScript(config: ProxyConfig): string {
  const { sslMode, port, autoStartService, cloudflareToken, customDomain } = config;

  let tunnelInstallSnippet = '';
  let tunnelLaunchHelp = '';

  if (sslMode === 'cloudflare_tunnel') {
    tunnelInstallSnippet = `
if ! command -v cloudflared &> /dev/null; then
  echo "🚀 Cloudflare Tunnel (cloudflared ARM64) を導入中..."
  curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
  sudo dpkg -i cloudflared.deb
  rm cloudflared.deb
fi`;
    tunnelLaunchHelp = `echo "🔒 トンネル起動: cloudflared tunnel --url http://127.0.0.1:${port}"`;
  } else if (sslMode === 'cf_custom_domain') {
    tunnelInstallSnippet = `
if ! command -v cloudflared &> /dev/null; then
  echo "🚀 Cloudflare Tunnel (cloudflared ARM64) を導入中..."
  curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
  sudo dpkg -i cloudflared.deb
  rm cloudflared.deb
fi`;
    tunnelLaunchHelp = cloudflareToken 
      ? `echo "🔒 独自ドメイン固定起動: sudo cloudflared service install ${cloudflareToken}"` 
      : `echo "🔒 独自ドメイン起動: cloudflared tunnel run <TUNNEL_NAME>"`;
  } else if (sslMode === 'tailscale_vpn') {
    tunnelInstallSnippet = `
echo "🛡️ Tailscale (WireGuard P2P VPN) を導入中..."
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up`;
    tunnelLaunchHelp = `echo "🔒 Tailscale IP確認: tailscale ip -4 (例: http://100.x.y.z:${port})"`;
  } else if (sslMode === 'pinggy_tunnel') {
    tunnelInstallSnippet = `
echo "⚡ Pinggy SSH トンネル準備完了 (追加ソフトインストール不要)"`;
    tunnelLaunchHelp = `echo "🔒 即座に別ドメインHTTPS公開: ssh -p 443 -R0:localhost:${port} a.pinggy.io"`;
  }

  return `#!/usr/bin/env bash
# ==============================================================================
# 🍓 Raspberry Pi 4B - Web Proxy & cURL Engine 全自動セットアップ
# ==============================================================================
set -e

sudo apt-get update -y
sudo apt-get install -y curl wget git ufw openssh-client

if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

APP_DIR="$HOME/raspi-web-proxy"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

cat << 'EOF' > package.json
${generatePackageJson(config)}
EOF

cat << 'EOF' > server.mjs
${generateNodeServerCode(config)}
EOF

${tunnelInstallSnippet}

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
ExecStart=$(which node) $APP_DIR/server.mjs
Restart=always
RestartSec=5
Environment=PORT=${port}

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable raspi-proxy
sudo systemctl restart raspi-proxy
` : ''}

LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "=============================================================================="
echo "🎉 セットアップ完了！"
echo "🌐 ローカル起動/待機中: http://$LOCAL_IP:${port}"
${tunnelLaunchHelp}
echo "=============================================================================="
`;
}
