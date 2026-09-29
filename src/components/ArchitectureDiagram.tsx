import React, { useState } from 'react';
import { ArrowRight, Smartphone, Laptop, Server, Globe, Shield, Lock, Activity, Eye, CheckCircle2, Zap } from 'lucide-react';
import { ProxyConfig } from '../types/proxy';

interface ArchitectureDiagramProps {
  config: ProxyConfig;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ config }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const getSslLabel = () => {
    switch (config.sslMode) {
      case 'cloudflare_tunnel':
        return 'Cloudflare Tunnel (無料HTTPS / ドメイン不要)';
      case 'mkcert_local':
        return 'mkcert (ローカル信頼HTTPS / 警告なし)';
      case 'duckdns_letsencrypt':
        return 'DuckDNS + Let\'s Encrypt (*.duckdns.org)';
      case 'sslip_io':
        return 'sslip.io (IP直結自動DNS)';
      case 'self_signed':
        return 'Self-Signed (自己署名SSL)';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              通信バイパス＆プロキシ中継の仕組み (Architecture Diagram)
            </h3>
            <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Raspberry Pi 4B
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            クライアントはRaspberry Piにアクセスするだけで、すべてのWeb通信がラズパイを経由（バイパス）して実行されます。
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>SSL方式: <strong className="text-rose-300">{getSslLabel()}</strong></span>
        </div>
      </div>

      {/* Interactive Data Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 relative">
        {/* Step 1: User Client */}
        <div 
          onMouseEnter={() => setActiveStep(1)}
          onMouseLeave={() => setActiveStep(null)}
          className={`p-4 rounded-xl border transition-all duration-300 ${
            activeStep === 1 || activeStep === null 
              ? 'bg-slate-950/90 border-slate-700/80 shadow-lg ring-1 ring-slate-700' 
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              STEP 1: クライアント
            </span>
            <div className="flex items-center gap-1 text-slate-400">
              <Smartphone className="w-4 h-4" />
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <h4 className="font-semibold text-sm text-slate-200 mb-1">
            スマホ / PC ブラウザ
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            利用者はブラウザでラズパイのURLを開く、またはプロキシに指定して通信します。
          </p>
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
            <div className="text-emerald-400 truncate">
              🔒 https://{config.sslMode === 'cloudflare_tunnel' ? 'xyz.trycloudflare.com' : `${config.raspiLocalIp || '192.168.1.50'}:${config.port}`}
            </div>
            <div className="text-slate-400 text-[10px]">
              ↳ 宛先: <span className="text-amber-300">Raspberry Pi 4B</span>
            </div>
          </div>
        </div>

        {/* Step 2: Raspberry Pi 4B (The Core Relay) */}
        <div 
          onMouseEnter={() => setActiveStep(2)}
          onMouseLeave={() => setActiveStep(null)}
          className={`p-4 rounded-xl border transition-all duration-300 relative ${
            activeStep === 2 || activeStep === null 
              ? 'bg-gradient-to-b from-slate-950 to-slate-900 border-rose-500/50 shadow-xl shadow-rose-950/30 ring-1 ring-rose-500/40' 
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`}
        >
          <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow">
            中継エンジン
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              STEP 2: 中継＆変換
            </span>
            <Server className="w-4 h-4 text-rose-400" />
          </div>
          <h4 className="font-semibold text-sm text-slate-100 mb-1 flex items-center gap-1.5">
            🍓 Raspberry Pi 4B
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            暗号化SSLを終端し、リクエストを代行送信。リンク書き換えやヘッダー匿名化を実施。
          </p>
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-rose-500/20 font-mono text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Node.js / Caddy</span>
              <span className="text-emerald-400 font-bold">Port {config.port}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              • クライアントIPを隠蔽 (Masked)
            </div>
            <div className="text-[10px] text-slate-400">
              • HTML & 相対パスを自動書き換え
            </div>
          </div>
        </div>

        {/* Step 3: Target Internet Service */}
        <div 
          onMouseEnter={() => setActiveStep(3)}
          onMouseLeave={() => setActiveStep(null)}
          className={`p-4 rounded-xl border transition-all duration-300 ${
            activeStep === 3 || activeStep === null 
              ? 'bg-slate-950/90 border-slate-700/80 shadow-lg ring-1 ring-slate-700' 
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              STEP 3: 目的のサイト
            </span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="font-semibold text-sm text-slate-200 mb-1">
            一般インターネット / 各種Web
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            目的のサーバーには「Raspberry PiのIPアドレス」からのアクセスとして記録されます。
          </p>
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
            <div className="text-sky-400 truncate">
              🌐 https://target-site.com
            </div>
            <div className="text-[10px] text-slate-400">
              送信元IP: <span className="text-rose-400 font-semibold">RasPiの自宅回線IP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>ドメイン購入費用 ¥0</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>ルーター開放不要 (Tunnel時)</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>ブラウザ単体で完結</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>HTTPS暗号化通信</span>
        </div>
      </div>
    </div>
  );
};
