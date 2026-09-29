import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, ArrowLeft, ArrowRight, RotateCw, ShieldCheck, ExternalLink, Sliders, Lock, Sparkles, Home, X, Check, HelpCircle, EyeOff } from 'lucide-react';
import { ProxyConfig } from '../types/proxy';
import { ProxyUtilityBar } from './ProxyUtilityBar';

interface SimpleBypassBrowserProps {
  config: ProxyConfig;
  onOpenSettings: () => void;
}

export const SimpleBypassBrowser: React.FC<SimpleBypassBrowserProps> = ({ config, onOpenSettings }) => {
  const [queryInput, setQueryInput] = useState('');
  const [searchEngine, setSearchEngine] = useState<'ddg' | 'yahoo' | 'google' | 'bing'>('ddg');
  const [currentUrl, setCurrentUrl] = useState('https://html.duckduckgo.com/html/?q=Raspberry+Pi+4B&kl=jp-jp');
  const [iframeSrc, setIframeSrc] = useState('/proxy-stream?engine=ddg&q=' + encodeURIComponent('Raspberry Pi 4B'));
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(['https://html.duckduckgo.com/html/?q=Raspberry+Pi+4B&kl=jp-jp']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isReaderMode, setIsReaderMode] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'RASPI_PROXY_NAVIGATED') {
        if (event.data.url) {
          try {
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

  const navigateTo = (input: string, engine = searchEngine) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    let target = trimmed;
    const isUrl = /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/i.test(trimmed) && !trimmed.includes(' ');

    let streamUrl = '';
    if (!isUrl) {
      if (engine === 'ddg') {
        target = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}&kl=jp-jp`;
      } else if (engine === 'yahoo') {
        target = `https://search.yahoo.co.jp/search?p=${encodeURIComponent(trimmed)}`;
      } else if (engine === 'bing') {
        target = `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}&setlang=ja`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}&hl=ja&gl=jp`;
      }
      streamUrl = `/proxy-stream?engine=${engine}&q=${encodeURIComponent(trimmed)}`;
    } else {
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }
      streamUrl = `/proxy-stream?url=${encodeURIComponent(target)}`;
    }

    setLoading(true);
    setCurrentUrl(target);
    setQueryInput(target);
    setIframeSrc(streamUrl);

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
      iframeRef.current.src = `${iframeSrc}&_t=${Date.now()}`;
    }
  };

  const bookmarks = [
    { name: '🦆 DuckDuckGo (CAPTCHAなし)', engine: 'ddg' as const, query: 'Raspberry Pi' },
    { name: '🇯🇵 Yahoo! JAPAN', url: 'https://m.yahoo.co.jp' },
    { name: '📖 Wikipedia 日本語', url: 'https://ja.wikipedia.org' },
    { name: '🔥 Hacker News', url: 'https://news.ycombinator.com' },
    { name: '🌐 IP確認 (httpbin)', url: 'https://httpbin.org/ip' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[620px] max-w-7xl mx-auto w-full rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Browser Bar */}
      <div className="bg-slate-950 px-3 sm:px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-3">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
            title="戻る"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
            title="進む"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleReload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            title="再読み込み"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>

        {/* Omnibox with Engine Selector */}
        <form onSubmit={handleFormSubmit} className="flex-1 max-w-3xl flex items-center gap-1.5 sm:gap-2 bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus-within:border-rose-500 rounded-xl px-2 sm:px-3 py-1.5 transition-all shadow-inner">
          {/* Search Engine Switcher */}
          <select
            value={searchEngine}
            onChange={(e) => setSearchEngine(e.target.value as any)}
            className="bg-slate-950 text-slate-200 text-xs font-semibold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none cursor-pointer"
            title="検索エンジンを切り替え"
          >
            <option value="ddg">🦆 DuckDuckGo (推奨)</option>
            <option value="yahoo">🇯🇵 Yahoo! JAPAN</option>
            <option value="bing">⚡ Bing</option>
            <option value="google">🔍 Google</option>
          </select>

          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="検索キーワード、または https://..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none font-sans"
          />

          {queryInput && (
            <button
              type="button"
              onClick={() => setQueryInput('')}
              className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shadow transition-all flex-shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">検索</span>
          </button>
        </form>

        {/* Actions */}
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
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">設定・npm</span>
          </button>
        </div>
      </div>

      {/* Utility Toolbar (Reader Mode, Dark Mode, Translator, Wayback Machine) */}
      <ProxyUtilityBar
        currentUrl={currentUrl}
        onNavigate={navigateTo}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isReaderMode={isReaderMode}
        setIsReaderMode={setIsReaderMode}
      />

      {/* Bookmarks Bar */}
      <div className="bg-slate-950/80 px-3 py-1.5 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-400 whitespace-nowrap pl-1">おすすめ:</span>
        {bookmarks.map((bm, i) => (
          <button
            key={i}
            onClick={() => {
              if (bm.url) navigateTo(bm.url);
              else if (bm.query) navigateTo(bm.query, bm.engine || searchEngine);
            }}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] whitespace-nowrap transition-all cursor-pointer"
          >
            <span>{bm.name}</span>
          </button>
        ))}

        <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium pr-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Stealth Bypass Engine 稼働中</span>
        </div>
      </div>

      {/* Viewport with CSS Filter modifiers for Dark Mode & Reader Mode */}
      <div className={`flex-1 w-full bg-white relative transition-all ${
        isDarkMode ? 'filter invert hue-rotate-180 contrast-95 bg-slate-950' : ''
      }`}>
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
