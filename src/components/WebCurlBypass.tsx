import React, { useState, useMemo } from 'react';
import { Terminal, Play, RotateCcw, Copy, Check, ExternalLink, ShieldCheck, Zap, Globe, Lock, Download, Eye, Layers, Sparkles, Code2, FileCode, CheckCircle2 } from 'lucide-react';

export const WebCurlBypass: React.FC = () => {
  const [urlInput, setUrlInput] = useState('https://ja.wikipedia.org/wiki/Raspberry_Pi');
  const [customCommand, setCustomCommand] = useState('curl -sSL --compressed -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0" "https://ja.wikipedia.org/wiki/Raspberry_Pi"');
  const [mode, setMode] = useState<'simple' | 'raw_cmd'>('simple');
  const [followRedirects, setFollowRedirects] = useState(true);
  const [fakeBrowserAgent, setFakeBrowserAgent] = useState(true);
  const [includeHeaders, setIncludeHeaders] = useState(false);
  const [ignoreSsl, setIgnoreSsl] = useState(false);
  const [useDoH, setUseDoH] = useState(false);
  const [useCompressed, setUseCompressed] = useState(true);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'rendered' | 'terminal' | 'headers' | 'json'>('rendered');
  const [copied, setCopied] = useState(false);

  const [result, setResult] = useState<{
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
    latencyMs: number;
    commandRun: string;
    url?: string;
  } | null>(null);

  const buildCommandFromOptions = (target: string) => {
    let cmd = 'curl -sS';
    if (useCompressed) cmd += ' --compressed';
    if (followRedirects) cmd += ' -L';
    if (includeHeaders) cmd += ' -i';
    if (ignoreSsl) cmd += ' -k';
    if (fakeBrowserAgent) cmd += ' -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"';
    if (useDoH) cmd += ' --doh-url "https://cloudflare-dns.com/dns-query"';
    cmd += ` "${target}"`;
    return cmd;
  };

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    setCustomCommand(buildCommandFromOptions(val));
  };

  const executeCurl = async (commandToRun?: string) => {
    const cmd = commandToRun || (mode === 'raw_cmd' ? customCommand : buildCommandFromOptions(urlInput));
    setLoading(true);

    try {
      const res = await fetch('/api/curl/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, url: urlInput })
      });
      const data = await res.json();
      setResult(data);

      // Auto pick best tab (JSON vs HTML vs Terminal)
      const raw = data.stdout || '';
      if (raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
        setActiveTab('json');
      } else if (raw.includes('<html') || raw.includes('<!DOCTYPE') || raw.includes('<body') || raw.includes('<div')) {
        setActiveTab('rendered');
      } else {
        setActiveTab('terminal');
      }
    } catch (err: any) {
      setResult({
        success: false,
        stdout: '',
        stderr: err.message || 'Execution error',
        exitCode: 1,
        latencyMs: 0,
        commandRun: cmd
      });
      setActiveTab('terminal');
    } finally {
      setLoading(false);
    }
  };

  const parsedOutput = useMemo(() => {
    if (!result || !result.stdout) return { headers: '', body: '', isJson: false, jsonFormatted: '', isHtml: false };

    const raw = result.stdout;
    let headers = '';
    let body = raw;

    // If HTTP headers were included with -i / -I
    if (raw.startsWith('HTTP/') || raw.startsWith('HTTP/1.') || raw.startsWith('HTTP/2')) {
      const doubleBreakIndex = raw.indexOf('\r\n\r\n') !== -1 ? raw.indexOf('\r\n\r\n') : raw.indexOf('\n\n');
      if (doubleBreakIndex !== -1) {
        headers = raw.slice(0, doubleBreakIndex).trim();
        body = raw.slice(doubleBreakIndex).trim();
      }
    }

    let isJson = false;
    let jsonFormatted = '';
    try {
      const parsed = JSON.parse(body);
      isJson = true;
      jsonFormatted = JSON.stringify(parsed, null, 2);
    } catch (e) {}

    const isHtml = body.includes('<html') || body.includes('<!DOCTYPE') || body.includes('<body') || body.includes('<div') || body.startsWith('<');

    return { headers, body, isJson, jsonFormatted, isHtml };
  }, [result]);

  const renderedHtmlDocument = useMemo(() => {
    if (!parsedOutput.body) return '';

    let baseOrigin = 'https://example.com/';
    try {
      if (urlInput.startsWith('http')) {
        const u = new URL(urlInput);
        baseOrigin = u.origin + '/';
      }
    } catch (e) {}

    const bodyContent = parsedOutput.body;

    if (parsedOutput.isHtml) {
      // Inject proper base tag and normalize relative styling
      const baseTag = `<base href="${baseOrigin}">`;
      let doc = bodyContent;
      if (doc.includes('<head>')) {
        doc = doc.replace('<head>', `<head>${baseTag}`);
      } else if (doc.includes('<HEAD>')) {
        doc = doc.replace('<HEAD>', `<HEAD>${baseTag}`);
      } else {
        doc = `${baseTag}${doc}`;
      }
      return doc;
    } else {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:20px;font-family:monospace;background:#f8fafc;color:#0f172a;line-height:1.6;white-space:pre-wrap;}</style></head><body>${escapeHtml(bodyContent)}</body></html>`;
    }
  }, [parsedOutput, urlInput]);

  function escapeHtml(str: string) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { label: '📖 Wikipedia 日本語 (高精度表示)', cmd: 'curl -sSL --compressed -A "Mozilla/5.0" "https://ja.wikipedia.org/wiki/Raspberry_Pi"', url: 'https://ja.wikipedia.org/wiki/Raspberry_Pi' },
    { label: '🦆 DuckDuckGo 検索', cmd: 'curl -sSL --compressed -A "Mozilla/5.0" "https://html.duckduckgo.com/html/?q=Raspberry+Pi&kl=jp-jp"', url: 'https://html.duckduckgo.com/html/?q=Raspberry+Pi&kl=jp-jp' },
    { label: '🌐 IP & 地域情報 (JSON)', cmd: 'curl -sSL --compressed "https://ipinfo.io/json"', url: 'https://ipinfo.io/json' },
    { label: '📡 レスポンスヘッダー詳細', cmd: 'curl -sSL -i --compressed "https://httpbin.org/headers"', url: 'https://httpbin.org/headers' },
    { label: '🛡️ DNS検閲回避 (DoH)', cmd: 'curl -sSL --compressed --doh-url "https://1.1.1.1/dns-query" "https://example.com"', url: 'https://example.com' }
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Terminal className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Web上での cURL 実行 ＆ 検閲回避コンソール
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              自動HTML整形 & CSS修復
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Raspberry PiのLinuxシェル上で直接 <code className="text-amber-300 font-mono">curl</code> を実行。相対パスやCSS崩れを自動修復し、文字化けゼロでWebページやJSONを描画します。
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs flex-shrink-0">
          <button
            onClick={() => setMode('simple')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'simple' ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GUI簡単設定
          </button>
          <button
            onClick={() => setMode('raw_cmd')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'raw_cmd' ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            コマンド直打ち
          </button>
        </div>
      </div>

      {/* Input & Option Controls Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {mode === 'simple' ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                取得したいWebサイトのURL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeCurl()}
                  placeholder="https://example.com"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => executeCurl()}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all flex-shrink-0 cursor-pointer"
                >
                  <Play className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>cURL 実行</span>
                </button>
              </div>
            </div>

            {/* Quick Flag Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={useCompressed}
                  onChange={(e) => {
                    setUseCompressed(e.target.checked);
                    setCustomCommand(buildCommandFromOptions(urlInput));
                  }}
                  className="w-3.5 h-3.5 text-amber-500 rounded"
                />
                <span className="font-mono text-[11px]">--compressed (解凍)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={followRedirects}
                  onChange={(e) => {
                    setFollowRedirects(e.target.checked);
                    setCustomCommand(buildCommandFromOptions(urlInput));
                  }}
                  className="w-3.5 h-3.5 text-amber-500 rounded"
                />
                <span className="font-mono text-[11px]">-L (リダイレクト追従)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={fakeBrowserAgent}
                  onChange={(e) => {
                    setFakeBrowserAgent(e.target.checked);
                    setCustomCommand(buildCommandFromOptions(urlInput));
                  }}
                  className="w-3.5 h-3.5 text-amber-500 rounded"
                />
                <span className="font-mono text-[11px]">-A (ブラウザ偽装)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => {
                    setIncludeHeaders(e.target.checked);
                    setCustomCommand(buildCommandFromOptions(urlInput));
                  }}
                  className="w-3.5 h-3.5 text-amber-500 rounded"
                />
                <span className="font-mono text-[11px]">-i (ヘッダー含む)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={ignoreSsl}
                  onChange={(e) => {
                    setIgnoreSsl(e.target.checked);
                    setCustomCommand(buildCommandFromOptions(urlInput));
                  }}
                  className="w-3.5 h-3.5 text-amber-500 rounded"
                />
                <span className="font-mono text-[11px]">-k (SSL無視)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={useDoH}
                  onChange={(e) => {
                    setUseDoH(e.target.checked);
                    setCustomCommand(buildCommandFromOptions(urlInput));
                  }}
                  className="w-3.5 h-3.5 text-amber-500 rounded"
                />
                <span className="font-mono text-[11px]">--doh (検閲回避)</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              実行する cURL コマンド (オプション自由指定)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeCurl()}
                placeholder='curl -sSL "https://..."'
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => executeCurl()}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all flex-shrink-0 cursor-pointer"
              >
                <Play className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>実行</span>
              </button>
            </div>
          </div>
        )}

        {/* Presets */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium">プリセット:</span>
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setUrlInput(p.url);
                setCustomCommand(p.cmd);
                executeCurl(p.cmd);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Output & Rendered View Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Output Header with Smart Tabs */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Smart View Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('rendered')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'rendered' ? 'bg-slate-800 text-emerald-300 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🖥️ Webプレビュー (HTML描画)
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'terminal' ? 'bg-slate-800 text-amber-300 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💻 ターミナル出力 (生stdout)
            </button>
            {parsedOutput.isJson && (
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeTab === 'json' ? 'bg-slate-800 text-sky-300 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📦 JSON整形ビュー
              </button>
            )}
            {parsedOutput.headers && (
              <button
                onClick={() => setActiveTab('headers')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeTab === 'headers' ? 'bg-slate-800 text-purple-300 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📡 HTTPヘッダー解析
              </button>
            )}
          </div>

          {/* Action buttons & latency */}
          <div className="flex items-center gap-3">
            {result && (
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{result.latencyMs}ms (Exit: {result.exitCode})</span>
              </span>
            )}
            {result?.stdout && (
              <button
                onClick={() => handleCopy(result.stdout)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'コピー完了' : '出力をコピー'}</span>
              </button>
            )}
          </div>
        </div>

        {/* View Content */}
        <div className="min-h-[460px] bg-slate-950 p-3 sm:p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 text-slate-400 space-y-3 font-mono text-xs">
              <RotateCcw className="w-8 h-8 text-amber-500 animate-spin" />
              <span>Raspberry Pi 4B シェルで cURL を実行中...</span>
            </div>
          ) : !result ? (
            <div className="flex flex-col items-center justify-center py-28 text-slate-400 text-xs space-y-2">
              <Terminal className="w-10 h-10 text-slate-600" />
              <p>URLを入力して「cURL 実行」をクリックしてください。</p>
              <p className="text-[11px] text-slate-400 font-mono">Raspberry Piから直接コマンドライン経由で取得します。</p>
            </div>
          ) : activeTab === 'rendered' ? (
            <div className="bg-white rounded-xl overflow-hidden border border-slate-300 shadow-inner">
              <iframe
                srcDoc={renderedHtmlDocument}
                title="cURL Rendered Output"
                sandbox="allow-same-origin allow-scripts"
                className="w-full h-[520px] border-none"
              />
            </div>
          ) : activeTab === 'json' ? (
            <div className="font-mono text-xs text-sky-300 space-y-3">
              <div className="text-amber-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <span>$</span>
                <span className="font-semibold">{result.commandRun}</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 overflow-x-auto max-h-[500px] leading-relaxed text-[12px] text-sky-200">
                <code>{parsedOutput.jsonFormatted}</code>
              </pre>
            </div>
          ) : activeTab === 'headers' ? (
            <div className="font-mono text-xs text-purple-300 space-y-3">
              <pre className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 overflow-x-auto max-h-[500px] leading-relaxed text-[12px] text-purple-200">
                <code>{parsedOutput.headers}</code>
              </pre>
            </div>
          ) : (
            <div className="font-mono text-xs text-slate-200 space-y-3">
              <div className="text-amber-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <span>$</span>
                <span className="font-semibold">{result.commandRun}</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-x-auto max-h-[500px] leading-relaxed text-[12px] text-slate-100 selection:bg-amber-500/30">
                <code>{result.stdout || result.stderr || '(No output)'}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
