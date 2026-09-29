import React, { useState } from 'react';
import { BookOpen, Moon, Sun, Languages, Archive, Image, ShieldAlert, Sparkles, Download, Check, Printer, ZoomIn, ZoomOut } from 'lucide-react';

interface ProxyUtilityBarProps {
  currentUrl: string;
  onNavigate: (url: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isReaderMode: boolean;
  setIsReaderMode: (val: boolean) => void;
}

export const ProxyUtilityBar: React.FC<ProxyUtilityBarProps> = ({
  currentUrl,
  onNavigate,
  isDarkMode,
  setIsDarkMode,
  isReaderMode,
  setIsReaderMode
}) => {
  const [copied, setCopied] = useState(false);

  // 1. Google Translate proxy wrapper
  const handleTranslate = () => {
    if (!currentUrl || !currentUrl.startsWith('http')) return;
    const translateUrl = `https://translate.google.com/translate?sl=auto&tl=ja&u=${encodeURIComponent(currentUrl)}`;
    onNavigate(translateUrl);
  };

  // 2. Wayback Machine Archive wrapper
  const handleWayback = () => {
    if (!currentUrl || !currentUrl.startsWith('http')) return;
    const archiveUrl = `https://web.archive.org/web/*/${currentUrl}`;
    onNavigate(archiveUrl);
  };

  // 3. Reader Mode toggle
  const handleToggleReader = () => {
    setIsReaderMode(!isReaderMode);
  };

  // 4. Dark Mode toggle
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="bg-slate-950/95 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between gap-2 text-xs overflow-x-auto">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>便利機能:</span>
        </span>

        {/* Reader Mode Button */}
        <button
          onClick={handleToggleReader}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
            isReaderMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
          title="広告・装飾を排除して記事本文だけを抽出"
        >
          <BookOpen className="w-3 h-3" />
          <span>{isReaderMode ? 'リーダー解除' : 'リーダーモード'}</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={handleToggleDarkMode}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
            isDarkMode
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
          title="全Webサイトにダークモードを強制適用"
        >
          {isDarkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3" />}
          <span>{isDarkMode ? 'ダーク解除' : 'ダークモード'}</span>
        </button>

        {/* One-Click Google Translate */}
        <button
          onClick={handleTranslate}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-medium transition-all cursor-pointer"
          title="ページ全体を日本語に翻訳"
        >
          <Languages className="w-3 h-3 text-sky-400" />
          <span>日本語翻訳</span>
        </button>

        {/* Wayback Machine Archive */}
        <button
          onClick={handleWayback}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-medium transition-all cursor-pointer"
          title="削除されたページの過去ログ・魚拓を確認"
        >
          <Archive className="w-3 h-3 text-emerald-400" />
          <span>過去魚拓 (Wayback)</span>
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-2 flex-shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400">
          <ShieldAlert className="w-3 h-3" />
          <span>広告・トラッカー自動ブロック稼働中</span>
        </span>
      </div>
    </div>
  );
};
