import React from 'react';
import { ShieldCheck, Cpu, Globe, Sliders, BookOpen, Sparkles, HelpCircle, Terminal } from 'lucide-react';

interface HeaderProps {
  activeTab: 'bypass_browser' | 'settings' | 'bot_lab' | 'guide' | 'comparison' | 'troubleshooting';
  setActiveTab: (tab: 'bypass_browser' | 'settings' | 'bot_lab' | 'guide' | 'comparison' | 'troubleshooting') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-rose-950/50">
              <Cpu className="w-5 h-5 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                  RasPi 4B HTTPS Bypass Proxy
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  npm / RasPi 4B
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                ドメイン不要・無料HTTPS中継 & Bot判定回避ブラウザ
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Primary Action Tab: Bypass Browser (Access Side) */}
            <button
              onClick={() => setActiveTab('bypass_browser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'bypass_browser'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-300" />
              <span>バイパスブラウザ (アクセス側)</span>
            </button>

            {/* Config & Settings Tab (Settings Side) */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>設定・npm管理 (設定側)</span>
            </button>

            {/* Anti-bot evasion lab */}
            <button
              onClick={() => setActiveTab('bot_lab')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'bot_lab'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Bot判定回避の仕組み</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'guide'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>構築手順</span>
            </button>

            <button
              onClick={() => setActiveTab('troubleshooting')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'troubleshooting'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
