import React from 'react';
import { ShieldCheck, Check, X, Sparkles, Globe, Key, AlertTriangle, ArrowRight, Zap, ShieldAlert, Wifi } from 'lucide-react';
import { SslMode } from '../types/proxy';

interface SslComparisonMatrixProps {
  onSelectMode: (mode: SslMode) => void;
  currentMode: SslMode;
}

export const SslComparisonMatrix: React.FC<SslComparisonMatrixProps> = ({ onSelectMode, currentMode }) => {
  const methods = [
    {
      id: 'tailscale_vpn' as SslMode,
      name: '🛡️ Tailscale (WireGuard P2P VPN)',
      recommended: true,
      domainCost: '¥0 (完全無料)',
      domainNeed: '不要 (プライベートIP直結)',
      sslCert: 'WireGuard暗号化 / MagicDNS',
      routerPortForward: '不要 (完全P2Pトンネル)',
      scope: '世界中どこからでもOK',
      censorshipResistance: '最強 (URL検閲・DNSブロック完全無効)',
      difficulty: '超かんたん (1コマンド)',
      pros: ['学校・職場のURLフィルターやtrycloudflareブロックを100%すり抜ける', '帯域制限なし・最高速度', 'スマホの全通信を自宅RasPi経由にするExit Nodeも可能'],
      cons: ['スマホ側にTailscaleアプリのインストールが必要']
    },
    {
      id: 'pinggy_tunnel' as SslMode,
      name: '⚡ Pinggy SSH トンネル',
      recommended: true,
      domainCost: '¥0 (無料)',
      domainNeed: '不要 (*.pinggy.link)',
      sslCert: '正規Let\'s Encrypt SSL (警告ゼロ)',
      routerPortForward: '不要',
      scope: '世界中どこからでもOK',
      censorshipResistance: '高 (trycloudflareと別ドメイン)',
      difficulty: '最速 (SSHコマンド1発)',
      pros: ['Raspberry Piに追加ソフトのインストールすら不要 (標準SSHのみ)', 'ブロックされていない別ドメインURLを即発行', 'ポート443経由でファイアウォール通過'],
      cons: ['無料版はセッション再接続時にURLが変わる']
    },
    {
      id: 'cloudflare_tunnel' as SslMode,
      name: '🌐 Cloudflare Quick Tunnel',
      recommended: false,
      domainCost: '¥0 (不要)',
      domainNeed: 'ドメイン取得なし',
      sslCert: '正規Cloudflare SSL (警告ゼロ)',
      routerPortForward: '不要 (CGNAT / DS-Lite も完全突破)',
      scope: '世界中どこからでもOK',
      censorshipResistance: '中 (学校等でtrycloudflare.com自体が拒否される場合あり)',
      difficulty: '超かんたん (npm run tunnel)',
      pros: ['ドメイン購入が一切不要', 'ルーターの設定変更・ポート開放不要', '日本のマンション回線 (DS-Lite/CGNAT) でも確実に繋がる'],
      cons: ['学校や一部Wi-Fiで *.trycloudflare.com がブラックリスト登録されている']
    },
    {
      id: 'cf_custom_domain' as SslMode,
      name: '🔒 Cloudflare Zero Trust (独自ドメイン)',
      recommended: false,
      domainCost: '無料ドメイン (f5.si等) または数百円',
      domainNeed: '独自ドメイン所持',
      sslCert: '正規Cloudflare SSL (警告ゼロ)',
      routerPortForward: '不要',
      scope: '世界中どこからでもOK',
      censorshipResistance: '極高 (独自ドメインのためブロック不可)',
      difficulty: '中級 (Cloudflareダッシュボード設定)',
      pros: ['固定ドメインでずっとアクセス可能', 'trycloudflare.comブロックを完全に回避'],
      cons: ['初回にCloudflareアカウントとドメイン登録が必要']
    },
    {
      id: 'mkcert_local' as SslMode,
      name: '🏠 mkcert (ローカル専用CA)',
      recommended: false,
      domainCost: '¥0 (不要)',
      domainNeed: 'ドメイン不要 (IP直接)',
      sslCert: 'ローカル信頼SSL (警告ゼロ)',
      routerPortForward: '不要',
      scope: '自宅Wi-Fi / LAN内のみ',
      censorshipResistance: '最高 (外部インターネット非経由)',
      difficulty: 'かんたん',
      pros: ['同一Wi-Fi内でブラウザ警告なし', 'オフライン・ローカル完全完結'],
      cons: ['外出先や外部インターネットからは接続できない']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-rose-400" />
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            HTTPS・トンネル接続方式 徹底比較（検閲耐性付き）
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          <code>trycloudflare.com</code> がブロックされる環境でも確実にRaspberry Piにアクセスするための代替手法一覧です。
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
              m.recommended
                ? 'bg-slate-900/95 border-amber-500/50 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/20'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  {m.name}
                </h4>
                {m.recommended && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    検閲回避推奨
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">費用</span>
                  <span className="text-slate-200 font-medium">{m.domainCost}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">ポート開放</span>
                  <span className="text-emerald-400 font-medium">{m.routerPortForward}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">検閲回避性能</span>
                  <span className="text-amber-300 font-bold">{m.censorshipResistance}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">難易度</span>
                  <span className="text-slate-200 font-mono">{m.difficulty}</span>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1">メリット:</span>
                  <ul className="space-y-1">
                    {m.pros.map((p, idx) => (
                      <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-rose-400 block mb-1">デメリット / 注意点:</span>
                  <ul className="space-y-1">
                    {m.cons.map((c, idx) => (
                      <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5 leading-snug">
                        <X className="w-3.5 h-3.5 text-rose-400/70 flex-shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectMode(m.id)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                currentMode === m.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <span>{currentMode === m.id ? '選択中' : 'この方式を設定する'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
