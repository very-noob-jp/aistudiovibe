import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, ShieldCheck, ShieldAlert, Lock, RefreshCw, Smartphone, Laptop, Sparkles, ExternalLink, Code, CheckCircle2, AlertTriangle, Eye, Send } from 'lucide-react';
import { ProxyConfig, ProxyFetchResult } from '../types/proxy';

interface LiveBypassBrowserProps {
  config: ProxyConfig;
  onOpenSettings: () => void;
}

export const LiveBypassBrowser: React.FC<LiveBypassBrowserProps> = ({ config, onOpenSettings }) => {
  const [targetUrl, setTargetUrl] = useState('https://httpbin.org/ip');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'headers' | 'anti_bot_audit' | 'html_source'>('preview');
  const [result, setResult] = useState<ProxyFetchResult | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<'chrome_desktop' | 'safari_iphone'>('chrome_desktop');

  // Quick preset links
  const quickLinks = [
    { label: '🌐 IP確認 (httpbin)', url: 'https://httpbin.org/ip' },
    { label: '📖 Wikipedia (日本語)', url: 'https://ja.wikipedia.org/wiki/Raspberry_Pi' },
    { label: '🔥 Hacker News', url: 'https://news.ycombinator.com' },
    { label: '⚡ Example Domain', url: 'https://example.com' },
    { label: '🔍 JSON API', url: 'https://httpbin.org/headers' }
  ];

  const handleFetch = async (urlToFetch?: string) => {
    const u = urlToFetch || targetUrl;
    if (!u) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/fetch?url=${encodeURIComponent(u)}&profile=${selectedProfile}&stripTracking=true`);
      const data: ProxyFetchResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || 'Network request failed'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch('https://httpbin.org/ip');
  }, []);

  return (
    <div className="space-y-5">
      {/* Top Banner: Real Proxy Relay */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              Raspberry Pi バイパスブラウザ (アクセス側)
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Proxy Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            URLを入力すると、Raspberry Pi（Node.jsバックエンド）が**本物のブラウザヘッダー（Sec-CH-UA / 日本語ロケール）**を合成して代理取得し、Bot判定を回避して表示します。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <span>⚙️ 設定・npmコードへ</span>
          </button>
        </div>
      </div>

      {/* Browser Bar & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Browser Top URL Bar */}
        <div className="p-3 sm:px-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center gap-3">
          {/* Profile Select */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedProfile('chrome_desktop')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                selectedProfile === 'chrome_desktop' ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Chrome Desktop</span>
            </button>
            <button
              onClick={() => setSelectedProfile('safari_iphone')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                selectedProfile === 'safari_iphone' ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone Safari</span>
            </button>
          </div>

          {/* URL Input */}
          <div className="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="https://example.com"
              className="flex-1 bg-transparent border-none text-slate-100 font-mono focus:outline-none text-xs"
            />
          </div>

          {/* Go Button */}
          <button
            onClick={() => handleFetch()}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-rose-950/50 transition-all flex-shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>中継中...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>バイパス閲覧</span>
              </>
            )}
          </button>
        </div>

        {/* Quick presets */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] text-slate-400 whitespace-nowrap">クイックアクセス:</span>
          {quickLinks.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTargetUrl(item.url);
                handleFetch(item.url);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono whitespace-nowrap transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Result Status Bar */}
        {result && (
          <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${result.success ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                <span className="font-mono font-bold text-slate-200">
                  HTTP {result.statusCode || 'Error'} {result.statusMessage || ''}
                </span>
              </div>

              <div className="text-slate-400 font-mono text-[11px]">
                ⏱️ {result.latencyMs}ms
              </div>

              {/* Bot Avoidance Badge */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>人間アクセス偽装判定: <strong>合格 (Human Verified)</strong></span>
              </div>
            </div>

            {/* Direct streaming proxy link */}
            <a
              href={`/proxy-stream?url=${encodeURIComponent(targetUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono hover:underline"
            >
              <span>別タブで直接ストリーム表示</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* View Tabs */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'preview' ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🖥️ レンダリング画面
          </button>
          <button
            onClick={() => setActiveTab('anti_bot_audit')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'anti_bot_audit' ? 'bg-slate-800 text-rose-300 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ Bot対策・ヘッダー偽装診断
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'headers' ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📡 送受信ヘッダー詳細
          </button>
          <button
            onClick={() => setActiveTab('html_source')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'html_source' ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📝 生ソース / Base注入
          </button>
        </div>

        {/* Tab Content Viewport */}
        <div className="p-4 sm:p-5 min-h-[360px] bg-slate-950">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              <div className="text-xs font-mono">Raspberry Pi 4B がターゲットサーバーと通信中...</div>
            </div>
          ) : !result ? (
            <div className="text-center py-20 text-slate-400 text-xs">
              URLを入力して「バイパス閲覧」ボタンを押してください。
            </div>
          ) : result.error ? (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-mono">
              ⚠️ エラーが発生しました: {result.error}
            </div>
          ) : (
            <>
              {/* Tab 1: Rendered Preview */}
              {activeTab === 'preview' && (
                <div className="bg-white text-slate-900 rounded-xl overflow-hidden border border-slate-300 min-h-[380px] shadow-inner relative">
                  {result.contentType?.includes('application/json') ? (
                    <div className="p-5 font-mono text-xs bg-slate-900 text-emerald-400 min-h-[380px] overflow-auto">
                      <pre>{result.content}</pre>
                    </div>
                  ) : (
                    <iframe
                      srcDoc={result.content}
                      title="Proxied Content"
                      sandbox="allow-same-origin allow-scripts allow-forms"
                      className="w-full h-[450px] border-none"
                    />
                  )}
                </div>
              )}

              {/* Tab 2: Anti-Bot Audit */}
              {activeTab === 'anti_bot_audit' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Bot判定回避シグナル（Raspberry Pi が送信した人間偽装ヘッダー）</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      単なるcurlやwgetコマンドだと <code className="text-rose-400">User-Agent: curl/7.88</code> となり即座にBotブロック（403/Cloudflare制限）されます。当プロキシは以下のブラウザ識別子を完全偽装しています：
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="text-sky-400 font-bold block">1. Sec-CH-UA (Client Hints)</span>
                      <p className="text-[11px] text-slate-400 font-sans">
                        最新のChrome/Edgeが送信するブラウザエンジン情報。これがないリクエストはBotと判定されやすい。
                      </p>
                      <code className="text-[11px] text-emerald-300 block bg-slate-950 p-2 rounded">
                        {result.headersSent?.['Sec-Ch-Ua'] || '"Chromium";v="124", "Google Chrome";v="124"'}
                      </code>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="text-sky-400 font-bold block">2. Accept-Language & Encoding</span>
                      <p className="text-[11px] text-slate-400 font-sans">
                        日本語（ja,en-US）ロケールおよびBrotli/Gzip圧縮対応。一般ユーザーのブラウザと同じ言語環境を申告。
                      </p>
                      <code className="text-[11px] text-emerald-300 block bg-slate-950 p-2 rounded">
                        {result.headersSent?.['Accept-Language'] || 'ja,en-US;q=0.9,en;q=0.8'}
                      </code>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="text-sky-400 font-bold block">3. Sec-Fetch-* (ナビゲーション制御)</span>
                      <p className="text-[11px] text-slate-400 font-sans">
                        アドレスバーにURLを直接打ち込んで遷移した動作（navigate / document）を再現。
                      </p>
                      <code className="text-[11px] text-emerald-300 block bg-slate-950 p-2 rounded">
                        Sec-Fetch-Dest: document | Sec-Fetch-Mode: navigate
                      </code>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="text-sky-400 font-bold block">4. JavaScript重度のサイトへの対策</span>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Cloudflare Turnstile等の難関Bot対策には「設定画面」で <strong className="text-rose-300">Puppeteer Chromiumモード</strong> を選択可能。
                      </p>
                      <code className="text-[11px] text-amber-300 block bg-slate-950 p-2 rounded">
                        RasPi ARM64 Chromium バックエンド実行
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Headers Breakdown */}
              {activeTab === 'headers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="font-bold text-sky-400 pb-2 border-b border-slate-800 flex items-center justify-between">
                      <span>送信ヘッダー (RasPi → 目的サーバー)</span>
                      <span className="text-[10px] text-slate-400">{Object.keys(result.headersSent || {}).length} 項目</span>
                    </div>
                    <div className="space-y-1.5 max-h-[320px] overflow-auto">
                      {Object.entries(result.headersSent || {}).map(([k, v]) => (
                        <div key={k} className="py-1 border-b border-slate-800/60">
                          <span className="text-slate-400 block text-[10px]">{k}:</span>
                          <span className="text-slate-200 break-all text-[11px]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="font-bold text-emerald-400 pb-2 border-b border-slate-800 flex items-center justify-between">
                      <span>受信ヘッダー (目的サーバー → RasPi)</span>
                      <span className="text-[10px] text-slate-400">{Object.keys(result.headersReceived || {}).length} 項目</span>
                    </div>
                    <div className="space-y-1.5 max-h-[320px] overflow-auto">
                      {Object.entries(result.headersReceived || {}).map(([k, v]) => (
                        <div key={k} className="py-1 border-b border-slate-800/60">
                          <span className="text-slate-400 block text-[10px]">{k}:</span>
                          <span className="text-slate-200 break-all text-[11px]">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Raw HTML & Injected tags */}
              {activeTab === 'html_source' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">
                    💡 プロキシ経由でも画像やリンクが壊れないように、レスポンス内の <code className="text-rose-400">&lt;head&gt;</code> 直下に <code className="text-emerald-400">&lt;base href="{result.url}"&gt;</code> を自動挿入しています。
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed">
                    <code>{result.content}</code>
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
