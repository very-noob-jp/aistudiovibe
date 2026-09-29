import React, { useState } from 'react';
import { Play, Globe, Shield, RefreshCw, ArrowRight, Eye, Code, Smartphone, CheckCircle, Lock, AlertCircle, Sparkles, Terminal } from 'lucide-react';
import { ProxyConfig } from '../types/proxy';

interface ProxySimulatorProps {
  config: ProxyConfig;
}

export const ProxySimulator: React.FC<ProxySimulatorProps> = ({ config }) => {
  const [inputUrl, setInputUrl] = useState('https://httpbin.org/ip');
  const [activePreset, setActivePreset] = useState<'ip' | 'wiki' | 'json' | 'news'>('ip');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'headers' | 'html_diff'>('preview');

  // Simulated Proxy Response State
  const [simulatedData, setSimulatedData] = useState({
    targetUrl: 'https://httpbin.org/ip',
    statusCode: 200,
    clientIp: '133.200.45.12 (スマホ・外出先キャリアIP)',
    raspiIp: '210.140.10.88 (自宅 Raspberry Pi 4B 固定/プロバイダIP)',
    originIpSeen: '210.140.10.88 (自宅RasPi経由でアクセスされたIP)',
    bypassed: true,
    latencyMs: 38,
    headersSent: {
      'Host': 'httpbin.org',
      'User-Agent': config.fakeUserAgent ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      'X-Forwarded-By': 'RasPi-4B-Proxy-Relay',
      'X-Real-Client': config.stripReferer ? '[REDACTED]' : 'Hidden by Proxy',
      'Accept': 'text/html,application/json,*/*'
    },
    headersReceived: {
      'content-type': 'application/json; charset=utf-8',
      'server': 'gunicorn/19.9.0',
      'access-control-allow-origin': '*',
      'date': new Date().toUTCString(),
      'x-proxy-injected-base': 'https://httpbin.org/'
    },
    rawContent: `{\n  "origin": "210.140.10.88",\n  "proxy_relay": "Raspberry Pi 4B",\n  "status": "Success - Traffic Bypassed via Home RasPi"\n}`
  });

  const handleSimulate = (urlToUse?: string, presetKey?: 'ip' | 'wiki' | 'json' | 'news') => {
    const target = urlToUse || inputUrl;
    setLoading(true);

    setTimeout(() => {
      let content = '';
      let ct = 'text/html';

      if (target.includes('httpbin.org/ip') || presetKey === 'ip') {
        content = `{\n  "origin": "210.140.10.88",\n  "user_agent": "${config.fakeUserAgent ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' : 'Mobile Safari'}",\n  "connection": "Proxied via Raspberry Pi 4B (Bypass Verified)"\n}`;
        ct = 'application/json';
      } else if (target.includes('wikipedia') || presetKey === 'wiki') {
        content = `<!DOCTYPE html>
<html>
<head>
  <base href="https://ja.wikipedia.org/">
  <style>body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b; }</style>
</head>
<body>
  <h2>🍓 Raspberry Pi 4B プロキシ経由で表示中: Wikipedia (日本語版)</h2>
  <p>このページはRaspberry Pi 4Bが代理でWikipediaサーバーから取得し、リンク・画像パスを補正した上であなたのブラウザに配信されています。</p>
  <div style="background:#f1f5f9;padding:15px;border-radius:8px;margin-top:15px;">
    <strong>✅ バイパス状態:</strong> 閲覧履歴やIPは自宅のRaspberry Piに集約されています。
  </div>
</body>
</html>`;
      } else if (target.includes('news') || presetKey === 'news') {
        content = `<!DOCTYPE html>
<html>
<head>
  <base href="https://news.ycombinator.com/">
  <style>body { font-family: monospace; padding: 15px; background: #ff660010; color: #222; }</style>
</head>
<body>
  <h3>🔥 Hacker News - Proxied Stream</h3>
  <ul>
    <li>1. Show HN: Raspberry Pi 4B Personal HTTPS Web Proxy (420 points)</li>
    <li>2. Why Cloudflare Tunnel is great for HomeLab without domain (280 points)</li>
    <li>3. Bypassing restricted networks using home proxies (190 points)</li>
  </ul>
</body>
</html>`;
      } else {
        content = `<!DOCTYPE html>
<html>
<head><base href="${target}/"></head>
<body style="font-family:sans-serif;padding:20px;">
  <h3>🌐 Proxied: ${target}</h3>
  <p>Target fetched successfully through Raspberry Pi 4B Node.js Engine.</p>
</body>
</html>`;
      }

      setSimulatedData(prev => ({
        ...prev,
        targetUrl: target,
        rawContent: content,
        latencyMs: Math.floor(Math.random() * 25) + 30,
        headersReceived: {
          ...prev.headersReceived,
          'content-type': ct,
          'date': new Date().toUTCString(),
          'x-proxy-injected-base': target
        }
      }));
      setLoading(false);
    }, 400);
  };

  const selectPreset = (preset: 'ip' | 'wiki' | 'json' | 'news', url: string) => {
    setActivePreset(preset);
    setInputUrl(url);
    handleSimulate(url, preset);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                インタラクティブ Webプロキシ 動作シミュレーター
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Raspberry Pi 4Bに構築したWebプロキシにアクセスした際、URLの解決、IPの偽装（自宅IP経由）、HTML/ヘッダーの自動書き換えがどう動作するかをリアルタイムに確認できます。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
              Port: <span className="text-emerald-400 font-bold">{config.port}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simulated Browser Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Browser Window Chrome Top */}
        <div className="p-3 sm:px-4 bg-slate-950 border-b border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Mac window dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>

          {/* Proxy URL Bar */}
          <div className="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-1 text-emerald-400 font-mono font-semibold flex-shrink-0">
              <Lock className="w-3.5 h-3.5" />
              <span>https://{config.sslMode === 'cloudflare_tunnel' ? 'quick-tunnel.trycloudflare.com' : `${config.raspiLocalIp || '192.168.1.50'}:${config.port}`}</span>
              <span className="text-slate-400">/proxy?url=</span>
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
              placeholder="https://example.com"
              className="flex-1 bg-transparent border-none text-slate-100 font-mono focus:outline-none text-xs"
            />
          </div>

          {/* Action button */}
          <button
            onClick={() => handleSimulate()}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-rose-950/50 transition-all"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>中継テスト実行</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] whitespace-nowrap">サンプルURL:</span>
          <button
            onClick={() => selectPreset('ip', 'https://httpbin.org/ip')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
              activePreset === 'ip' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            🌐 IP確認 (httpbin)
          </button>
          <button
            onClick={() => selectPreset('wiki', 'https://ja.wikipedia.org/wiki/Raspberry_Pi')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
              activePreset === 'wiki' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            📖 Wikipedia (HTML中継)
          </button>
          <button
            onClick={() => selectPreset('news', 'https://news.ycombinator.com')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
              activePreset === 'news' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            🔥 Hacker News
          </button>
        </div>

        {/* IP Bypass Comparison Status Banner */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">1. アクセス元の端末IP (非公開)</span>
            <span className="font-mono text-slate-300 font-semibold">{simulatedData.clientIp}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/30 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-rose-400 block font-bold">2. 中継したRaspberry Pi 4B</span>
              <span className="text-[10px] text-emerald-400 font-mono">RTT: {simulatedData.latencyMs}ms</span>
            </div>
            <span className="font-mono text-rose-300 font-bold">{simulatedData.raspiIp}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-emerald-400 block font-medium">3. 相手Webサーバーが検出したIP</span>
            <span className="font-mono text-emerald-300 font-semibold">{simulatedData.originIpSeen}</span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'preview' ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              レンダリング画面
            </button>
            <button
              onClick={() => setViewMode('headers')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'headers' ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HTTPヘッダー解析
            </button>
            <button
              onClick={() => setViewMode('html_diff')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'html_diff' ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Baseタグ注入・ソース
            </button>
          </div>

          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Proxy Status: 200 OK (Bypass Active)</span>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="p-4 sm:p-6 min-h-[320px] bg-slate-950 flex flex-col justify-start">
          {viewMode === 'preview' && (
            <div className="bg-white text-slate-900 rounded-xl p-5 shadow-lg border border-slate-300 font-sans min-h-[260px] relative">
              <div className="absolute top-2 right-3 text-[10px] font-mono bg-slate-900 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>🍓 Proxied View</span>
              </div>
              <div 
                dangerouslySetInnerHTML={{ __html: simulatedData.rawContent.startsWith('{') ? `<pre style="font-family:monospace;background:#f8fafc;padding:15px;border-radius:8px;font-size:13px;">${simulatedData.rawContent}</pre>` : simulatedData.rawContent }}
              />
            </div>
          )}

          {viewMode === 'headers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-sky-400 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span>Raspberry Pi が送信したヘッダー (Request)</span>
                </div>
                {Object.entries(simulatedData.headersSent).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">{k}:</span>
                    <span className="text-slate-200 font-semibold">{v}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span>Raspberry Pi が受信したヘッダー (Response)</span>
                </div>
                {Object.entries(simulatedData.headersReceived).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">{k}:</span>
                    <span className="text-slate-200 font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'html_diff' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                💡 WebプロキシはHTML内の画像やリンクが壊れないよう、<code className="text-rose-300">&lt;base href="..."&gt;</code> タグを自動注入してレスポンスします。
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                <code>{simulatedData.rawContent}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
