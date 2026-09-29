import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, FileCode, Shield, Server, RefreshCw, Key, Globe, Eye, Settings2, Sparkles, ExternalLink, Play, Cpu, Layers } from 'lucide-react';
import { ProxyConfig, SslMode, AntiBotEngine } from '../types/proxy';
import { generateNodeServerCode, generateSetupBashScript, generatePackageJson } from '../data/proxyTemplates';

interface ConfigGeneratorProps {
  config: ProxyConfig;
  setConfig: React.Dispatch<React.SetStateAction<ProxyConfig>>;
  onOpenLiveBrowser: () => void;
}

export const ConfigGenerator: React.FC<ConfigGeneratorProps> = ({ config, setConfig, onOpenLiveBrowser }) => {
  const [activeTab, setActiveTab] = useState<'setup_sh' | 'package_json' | 'server_mjs'>('setup_sh');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const codeFiles = {
    setup_sh: {
      name: 'setup.sh (npm対応・全自動インストーラー)',
      filename: 'setup.sh',
      language: 'bash',
      content: generateSetupBashScript(config)
    },
    package_json: {
      name: 'package.json (npm scripts設定)',
      filename: 'package.json',
      language: 'json',
      content: generatePackageJson(config)
    },
    server_mjs: {
      name: 'server.mjs (中継プロキシ本体)',
      filename: 'server.mjs',
      language: 'javascript',
      content: generateNodeServerCode(config)
    }
  };

  const currentFile = codeFiles[activeTab];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Configuration Controls Sidebar (5 cols on lg) */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
              <Settings2 className="w-4 h-4 text-rose-400" />
              Raspberry Pi 4B 設定・npmパラメータ
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              npm ready
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* 1. Anti-Bot Engine Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                ① Bot判定回避エンジンの選択 (重要)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'header_spoofing',
                    name: 'Sec-CH-UA ヘッダー完全偽装 (推奨・超高速)',
                    badge: '超軽量 / 依存ゼロ',
                    desc: '最新ChromeのClient Hints・日本語ロケールを合成。95%の通常WebやWikipedia・ニュースを軽量高速に中継。'
                  },
                  {
                    id: 'puppeteer_chromium',
                    name: '本物のChromium実行 (Puppeteer ARM64)',
                    badge: 'Cloudflare / JS完全突破',
                    desc: 'Raspberry Pi内で本物のChromiumブラウザをバックグラウンド実行。重厚なJavaScriptやTurnstile認証も突破。'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, antiBotEngine: item.id as AntiBotEngine }))}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      config.antiBotEngine === item.id
                        ? 'bg-rose-500/10 border-rose-500/50 shadow-sm shadow-rose-500/10 ring-1 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold text-xs sm:text-sm ${config.antiBotEngine === item.id ? 'text-rose-300' : 'text-slate-200'}`}>
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 whitespace-nowrap">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. SSL & Domain Option */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  ② トンネル・HTTPS接続方式
                </span>
                <span className="text-[10px] text-amber-400 font-normal">
                  ※trycloudflareブロック時はTailscale/Pinggy推奨
                </span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'tailscale_vpn',
                    name: '🛡️ Tailscale WireGuard (完全検閲回避・超推奨)',
                    badge: '最強P2P暗号化 / 検閲ゼロ',
                    desc: '学校や職場のファイアウォール・DNS制限を100%すり抜け。Raspberry Piとスマホを直結するゼロ設定メッシュVPN。'
                  },
                  {
                    id: 'pinggy_tunnel',
                    name: '⚡ Pinggy SSH トンネル (登録不要・別ドメイン)',
                    badge: 'インストール不要',
                    desc: '「ssh -p 443 -R0:localhost:8443 a.pinggy.io」を実行するだけで *.pinggy.link の安全なHTTPSが即発行。'
                  },
                  {
                    id: 'cf_custom_domain',
                    name: '🔒 Cloudflare Zero Trust (独自ドメイン)',
                    badge: '固定ドメイン / 検閲回避',
                    desc: '無料取得した独自ドメインやf5.si等をCloudflareに接続。trycloudflare.comのブラックリストを回避。'
                  },
                  {
                    id: 'cloudflare_tunnel',
                    name: '🌐 Cloudflare Quick Tunnel (*.trycloudflare.com)',
                    badge: '完全無料 / コマンド1発',
                    desc: '「npm run tunnel」で即座に公開。※学校等の環境によってはドメイン自体がブロックされる場合があります。'
                  },
                  {
                    id: 'mkcert_local',
                    name: '🏠 mkcert (ローカルLAN内専用)',
                    badge: 'LAN内専用 / 警告ゼロ',
                    desc: 'Raspberry Pi内部にローカルCAを作成。同一Wi-Fi内から警告なしで通信。'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, sslMode: item.id as SslMode }))}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      config.sslMode === item.id
                        ? 'bg-rose-500/10 border-rose-500/50 shadow-sm shadow-rose-500/10 ring-1 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold text-xs ${config.sslMode === item.id ? 'text-rose-300' : 'text-slate-200'}`}>
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 whitespace-nowrap">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Port & Auth */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                ③ 待ち受けポート & 認証
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ポート番号</label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 8443 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">自動起動 (systemd)</label>
                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoStartService}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoStartService: e.target.checked }))}
                      className="w-4 h-4 text-rose-500 rounded"
                    />
                    <span>常時稼働</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onOpenLiveBrowser}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 text-emerald-300" />
                <span>今すぐバイパスブラウザでテストする</span>
              </button>
            </div>
          </div>
        </div>

        {/* NPM Instructions Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Raspberry Pi 4B での npm 実行手順
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
            <li>Raspberry Piのターミナルで <code className="text-rose-300">mkdir raspi-proxy && cd raspi-proxy</code></li>
            <li>右側の <code className="text-emerald-300">package.json</code> と <code className="text-emerald-300">server.mjs</code> を配置</li>
            <li><code className="text-rose-300">npm install</code> を実行</li>
            <li><code className="text-emerald-400 font-bold">npm start</code> でプロキシサーバーが起動！</li>
          </ol>
        </div>
      </div>

      {/* Code Viewer Panel (7 cols on lg) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Tab Selection */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex-wrap gap-2">
            {/* File Switcher Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {(Object.keys(codeFiles) as Array<keyof typeof codeFiles>).map((key) => {
                const item = codeFiles[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === key
                        ? 'bg-slate-800 text-rose-300 border border-slate-700 shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>{item.filename}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(currentFile.content, activeTab)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/50 transition-all"
              >
                {copied === activeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>コピー完了!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>コードをコピー</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDownload(currentFile.filename, currentFile.content)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                title="ファイルとしてダウンロード"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DL</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="relative">
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>{currentFile.name}</span>
              </div>
              <span>{currentFile.content.split('\n').length} 行 • UTF-8</span>
            </div>

            <pre className="p-4 sm:p-5 text-xs sm:text-[13px] font-mono leading-relaxed text-slate-200 overflow-x-auto max-h-[580px] bg-slate-950 selection:bg-rose-500/30">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
