import React, { useState } from 'react';
import { Wifi, ShieldCheck, Smartphone, Laptop, CheckCircle2, Copy, Check, Terminal, FileCode, ArrowRight, Sparkles, HelpCircle, RefreshCw, Key } from 'lucide-react';
import { ProxyConfig } from '../types/proxy';

interface PacProxyGuideProps {
  config: ProxyConfig;
}

export const PacProxyGuide: React.FC<PacProxyGuideProps> = ({ config }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeDevice, setActiveDevice] = useState<'ios' | 'android' | 'windows' | 'mac'>('ios');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const raspiIp = config.raspiLocalIp || '192.168.1.50';
  const proxyPort = config.port || 8443;

  return (
    <div className="space-y-6">
      {/* Top Banner: Cisco Umbrella & OS Proxy Explanation */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm sm:text-base">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>Cisco Umbrella 回避：OS標準「Wi-Fi プロキシ設定 (HTTP / PAC)」</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Cisco Umbrella</strong> は主に端末からの「DNS名前解決」や「直接のHTTP/HTTPS通信」を監視・遮断します。<br />
          スマホ（iPhone / Android）やPCのWi-Fi設定で<strong>プロキシ（手動 または PAC 自動構成URL）</strong>を設定すると、端末の全ブラウザ通信がDNS問い合わせを含めてRaspberry Piへ中継されるため、Cisco UmbrellaのDNSブロックを完全に回避できます。
        </p>
      </div>

      {/* Two Methods: Manual Proxy vs PAC URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Method A: Manual Proxy IP:Port */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                方法①：手動プロキシ（IPとポート指定）
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                最速設定
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Wi-Fi設定の「HTTPプロキシ」を「手動」にし、Raspberry Pi（またはトンネル先）のホストとポートを入力します。
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">サーバー / ホスト:</span>
                <span className="text-emerald-400 font-semibold">{raspiIp} (または Tailscale IP)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">ポート番号:</span>
                <span className="text-emerald-400 font-semibold">{proxyPort}</span>
              </div>
              {config.enableAuth && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">認証:</span>
                  <span className="text-amber-400">{config.username} / {config.password}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleCopy(`${raspiIp}:${proxyPort}`, 'manual_val')}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copied === 'manual_val' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied === 'manual_val' ? 'コピー完了' : 'プロキシ情報をコピー'}</span>
          </button>
        </div>

        {/* Method B: PAC Auto-Config URL */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                方法②：自動プロキシ構成URL (PAC URL)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                プロキシURL指定
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Wi-Fi設定の「プロキシの構成」を「自動」にし、PACファイルのURLを入力します。Raspberry Piが自動で `proxy.pac` を配信します。
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
              <span className="text-slate-400 block text-[11px]">プロキシ自動構成URL:</span>
              <div className="text-sky-300 break-all font-semibold bg-slate-900 p-2 rounded border border-slate-800 text-[11px]">
                http://{raspiIp}:{proxyPort}/proxy.pac
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCopy(`http://${raspiIp}:${proxyPort}/proxy.pac`, 'pac_url')}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copied === 'pac_url' ? <Check className="w-4 h-4 text-sky-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied === 'pac_url' ? 'コピー完了' : 'PAC URL をコピー'}</span>
          </button>
        </div>
      </div>

      {/* Device-by-Device Setup Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
            <Smartphone className="w-4 h-4 text-rose-400" />
            端末別 Wi-Fi プロキシ設定手順
          </h3>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveDevice('ios')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeDevice === 'ios' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              iPhone / iPad (iOS)
            </button>
            <button
              onClick={() => setActiveDevice('android')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeDevice === 'android' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setActiveDevice('windows')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeDevice === 'windows' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Windows PC
            </button>
            <button
              onClick={() => setActiveDevice('mac')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeDevice === 'mac' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mac
            </button>
          </div>
        </div>

        {/* Step details based on active device */}
        <div className="text-xs text-slate-300 space-y-3 pt-1">
          {activeDevice === 'ios' && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <div>
                  <strong>「設定」アプリ ➔ 「Wi-Fi」</strong> を開き、接続中のWi-Fiの右側にある <strong>(i) マーク</strong> をタップします。
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <div>
                  一番下までスクロールし、<strong>「HTTPプロキシ」➔「プロキシを構成」</strong> をタップします。
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                <div>
                  <strong>「手動」</strong> を選択し、サーバーに <code>{raspiIp}</code>、ポートに <code>{proxyPort}</code> を入力して「保存」します。<br />
                  （または<strong>「自動」</strong>を選び、URLに <code>http://{raspiIp}:{proxyPort}/proxy.pac</code> を入力します）
                </div>
              </div>
            </div>
          )}

          {activeDevice === 'android' && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <div>
                  <strong>「設定」➔「ネットワークとインターネット」➔「インターネット（またはWi-Fi）」</strong> を開きます。
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <div>
                  接続中のWi-Fiの歯車アイコンをタップし、上部の<strong>鉛筆（編集）アイコン</strong>をタップします。
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                <div>
                  <strong>「詳細設定」➔「プロキシ」</strong> で「手動」または「自動構成」を選択し、入力して保存します。
                </div>
              </div>
            </div>
          )}

          {activeDevice === 'windows' && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <div>
                  <strong>「設定」➔「ネットワークとインターネット」➔「プロキシ」</strong> を開きます。
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <div>
                  <strong>「プロキシ サーバーを使う」</strong> の「セットアップ」をクリックし、プロキシをONにしてIPとポートを入力し保存します。
                </div>
              </div>
            </div>
          )}

          {activeDevice === 'mac' && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <div>
                  <strong>「システム設定」➔「Wi-Fi」➔ 接続中のWi-Fiの「詳細...」➔「プロキシ」タブ</strong> を開きます。
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <div>
                  <strong>「Webプロキシ (HTTP)」</strong> および <strong>「セキュアWebプロキシ (HTTPS)」</strong> にチェックを入れ、ホストとポートを入力して「OK」をクリックします。
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
