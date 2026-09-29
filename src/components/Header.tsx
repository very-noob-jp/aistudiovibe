import React from 'react';
import { Cpu, Globe, Terminal, Sliders, BookOpen, ShieldCheck, HelpCircle, Wifi, EyeOff, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'browser' | 'curl_terminal' | 'wifi_pac' | 'stealth' | 'settings' | 'bot_lab' | 'guide' | 'comparison' | 'troubleshooting';
  setActiveTab: (tab: 'browser' | 'curl_terminal' | 'wifi_pac' | 'stealth' | 'settings' | 'bot_lab' | 'guide' | 'comparison' | 'troubleshooting') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white shadow-md">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                RasPi 4B Proxy Suite
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Stealth
              </span>
            </div>
          </div>

          {/* Clean Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Mode 1: Web Browser */}
            <button
              onClick={() => setActiveTab('browser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'browser'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>ブラウザ (便利機能付)</span>
            </button>

            {/* Mode 2: Web cURL Bypass */}
            <button
              onClick={() => setActiveTab('curl_terminal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'curl_terminal'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Web cURL</span>
            </button>

            {/* Mode 3: Stealth Camouflage Guide */}
            <button
              onClick={() => setActiveTab('stealth')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'stealth'
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-emerald-400 hover:text-emerald-200 hover:bg-slate-900'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>🕵️ ステルス偽装</span>
            </button>

            {/* Mode 4: Wi-Fi Proxy / Cisco Umbrella Bypass */}
            <button
              onClick={() => setActiveTab('wifi_pac')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'wifi_pac'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'text-indigo-400 hover:text-indigo-200 hover:bg-slate-900'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wi-Fi設定 (Umbrella)</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden md:inline">設定・npm</span>
            </button>

            {/* FAQ */}
            <button
              onClick={() => setActiveTab('troubleshooting')}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'troubleshooting'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FAQ</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
