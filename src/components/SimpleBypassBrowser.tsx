import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, ArrowLeft, ArrowRight, RotateCw, ShieldCheck, ExternalLink, Sliders, Lock, Sparkles, Home, X } from 'lucide-react';
import { ProxyConfig } from '../types/proxy';

interface SimpleBypassBrowserProps {
  config: ProxyConfig;
  onOpenSettings: () => void;
}

export const SimpleBypassBrowser: React.FC<SimpleBypassBrowserProps> = ({ config, onOpenSettings }) => {
  const [queryInput, setQueryInput] = useState('');
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com/search?q=Raspberry+Pi+4B&hl=ja&gl=jp');
  const [iframeSrc, setIframeSrc] = useState('/proxy-stream?url=' + encodeURIComponent('https://www.google.com/search?q=Raspberry+Pi+4B&hl=ja&gl=jp'));
  const [loading, setLoading] = useState(false);
  const [searchEngine, setSearchEngine] = useState<'google' | 'duckduckgo' | 'bing'>('google');
  const [history, setHistory] = useState<string[]>(['https://www.google.com/search?q=Raspberry+Pi+4B&hl=ja&gl=jp']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for navigation messages from the proxied DOM script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'RASPI_PROXY_NAVIGATED') {
        if (event.data.url) {
          try {
            // Extract the original target URL from the /proxy-stream?url=...
            const u = new URL(event.data.url);
            const actual = u.searchParams.get('url') || event.data.url;
            setCurrentUrl(actual);
            setQueryInput(actual);
          } catch(e) {}
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const navigateTo = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    let target = trimmed;
    const isUrl = /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/i.test(trimmed) && !trimmed.includes(' ');

    if (!isUrl) {
      // Search Query
      if (searchEngine === 'bing') {
        target = `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`;
      } else if (searchEngine === 'duckduckgo') {
        target = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}&hl=ja&gl=jp`;
      }
    } else {
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }
    }

    setLoading(true);
    setCurrentUrl(target);
    setQueryInput(target);
    const newStreamUrl = `/proxy-stream?url=${encodeURIComponent(target)}`;
    setIframeSrc(newStreamUrl);

    // Update history stack
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(target);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(queryInput);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(prev);
      setQueryInput(prev);
      setIframeSrc(`/proxy-stream?url=${encodeURIComponent(prev)}`);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(next);
      setQueryInput(next);
      setIframeSrc(`/proxy-stream?url=${encodeURIComponent(next)}`);
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      setLoading(true);
      iframeRef.current.src = `/proxy-stream?url=${encodeURIComponent(currentUrl)}&_t=${Date.now()}`;
    }
  };

  const handleHome = () => {
    const homeUrl = 'https://www.google.com/?hl=ja';
    navigateTo(homeUrl);
  };

  const bookmarks = [
    { name: 'Google 検索', icon: '🔍', query: 'Google' },
    { name: 'Wikipedia 日本語', icon: '📖', url: 'https://ja.wikipedia.org' },
    { name: 'Yahoo! JAPAN', icon: '🇯🇵', url: 'https://m.yahoo.co.jp' },
    { name: 'Hacker News', icon: '🔥', url: 'https://news.ycombinator.com' },
    { name: 'IP確認 (httpbin)', icon: '🌐', url: 'https://httpbin.org/ip' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] max-w-7xl mx-auto w-full rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Simple Browser Bar (Chrome / Safari Style) */}
      <div className="bg-slate-950 px-3 sm:px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-3">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="戻る"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="進む"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleReload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="再読み込み"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
          <button
            onClick={handleHome}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors hidden sm:inline-flex"
            title="ホーム (Google)"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox (Search & URL Input in ONE) */}
        <form onSubmit={handleFormSubmit} className="flex-1 max-w-3xl flex items-center gap-2 bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus-within:border-rose-500 rounded-xl px-3 py-1.5 transition-all shadow-inner">
          <div className="flex items-center gap-1 text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-semibold uppercase hidden md:inline px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              RasPi Proxy
            </span>
          </div>

          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Google検索キーワード、または URL (https://...)"
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none font-sans"
          />

          {queryInput && (
            <button
              type="button"
              onClick={() => setQueryInput('')}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shadow transition-all flex-shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">開く / 検索</span>
          </button>
        </form>

        {/* Settings & External Link Action */}
        <div className="flex items-center gap-1.5">
          <a
            href={iframeSrc}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors hidden sm:inline-flex"
            title="別タブで開く"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all"
            title="設定・コード生成画面へ"
          >
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">設定・npm</span>
          </button>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="bg-slate-950/80 px-3 py-1.5 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-400 whitespace-nowrap pl-1">ブックマーク:</span>
        {bookmarks.map((bm, i) => (
          <button
            key={i}
            onClick={() => {
              if (bm.url) navigateTo(bm.url);
              else if (bm.query) navigateTo(bm.query);
            }}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] whitespace-nowrap transition-all"
          >
            <span>{bm.icon}</span>
            <span>{bm.name}</span>
          </button>
        ))}

        <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pr-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>DOMリンク自動中継 & Bot回避中</span>
        </div>
      </div>

      {/* Main Web Viewport (Live Proxied Iframe with injected DOM script) */}
      <div className="flex-1 w-full bg-white relative">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title="Raspberry Pi Proxied Web View"
          onLoad={() => setLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          className="w-full h-full border-none"
        />

        {loading && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 shadow-xl flex items-center gap-2 text-xs font-medium text-slate-200">
              <RotateCw className="w-4 h-4 text-rose-400 animate-spin" />
              <span>Raspberry Pi 4B が通信中...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
