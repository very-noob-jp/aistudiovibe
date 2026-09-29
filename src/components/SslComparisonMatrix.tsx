import React from 'react';
import { ShieldCheck, Check, X, Sparkles, Globe, Key, AlertTriangle, ArrowRight } from 'lucide-react';
import { SslMode } from '../types/proxy';

interface SslComparisonMatrixProps {
  onSelectMode: (mode: SslMode) => void;
  currentMode: SslMode;
}

export const SslComparisonMatrix: React.FC<SslComparisonMatrixProps> = ({ onSelectMode, currentMode }) => {
  const methods = [
    {
      id: 'cloudflare_tunnel' as SslMode,
      name: 'Cloudflare Tunnel (Quick Tunnel)',
      recommended: true,
      domainCost: '¥0 (不要)',
      domainNeed: 'ドメイン取得なし',
      sslCert: '正規Let\'s Encrypt / Cloudflare SSL (警告ゼロ)',
      routerPortForward: '不要 (CGNAT / DS-Lite も完全突破)',
      scope: '世界中どこからでもOK',
      difficulty: '超かんたん (コマンド1発)',
      pros: ['ドメイン購入が一切不要', 'ルーターの設定変更・ポート開放不要', '日本のマンション回線 (DS-Lite/CGNAT) でも確実に繋がる'],
      cons: ['Cloudflareの無料利用規約に準拠する必要がある']
    },
    {
      id: 'mkcert_local' as SslMode,
      name: 'mkcert (ローカル専用CA)',
      recommended: false,
      domainCost: '¥0 (不要)',
      domainNeed: 'ドメイン不要 (IP直接)',
      sslCert: 'ローカル信頼SSL (警告ゼロ)',
      routerPortForward: '不要',
      scope: '自宅Wi-Fi / LAN内のみ',
      difficulty: 'かんたん',
      pros: ['同一Wi-Fi内でブラウザ警告なし', 'オフライン・ローカル完全完結', '手軽な開発・テストに最適'],
      cons: ['外出先や外部インターネットからは接続できない', 'クライアント端末にルートCAの信頼設定が必要']
    },
    {
      id: 'duckdns_letsencrypt' as SslMode,
      name: 'DuckDNS + Let\'s Encrypt (Caddy)',
      recommended: false,
      domainCost: '¥0 (無料ドメイン)',
      domainNeed: '無料取得 (*.duckdns.org)',
      sslCert: '正規Let\'s Encrypt SSL (警告ゼロ)',
      routerPortForward: '要 (80/443番ポート)',
      scope: '世界中どこからでもOK',
      difficulty: '中級',
      pros: ['固定した無料サブドメインが手に入る', '標準的なWebサーバー構成を学べる'],
      cons: ['ルーターのポートフォワーディング設定が必要', 'プロバイダがポート80/443をブロックしている場合は不可']
    },
    {
      id: 'sslip_io' as SslMode,
      name: 'sslip.io (IP直結DNS)',
      recommended: false,
      domainCost: '¥0 (不要)',
      domainNeed: 'ドメイン登録なし',
      sslCert: '自己署名 または DNS-01',
      routerPortForward: 'LAN内なら不要',
      scope: 'LAN & WAN',
      difficulty: '初級',
      pros: ['192-168-1-50.sslip.io のようにIPをドメイン形式に自動変換', 'DNSサーバーの設定が不要'],
      cons: ['パブリックSSL発行にはDNS-01チャレンジが必要']
    },
    {
      id: 'self_signed' as SslMode,
      name: '自己署名 SSL (OpenSSL)',
      recommended: false,
      domainCost: '¥0 (不要)',
      domainNeed: 'ドメイン不要',
      sslCert: '自己署名 (ブラウザ赤色警告あり)',
      routerPortForward: '不要',
      scope: 'LAN内',
      difficulty: '最速 (1コマンド)',
      pros: ['OpenSSLコマンドだけで即座に作成可能', '外部サービス依存ゼロ'],
      cons: ['アクセス時に「この接続ではプライバシーが保護されません」と警告が出る']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-rose-400" />
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            ドメイン取得なし・無料ドメインでのHTTPS方式 徹底比較
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          「独自ドメインを買わずにRaspberry Pi 4BをHTTPS化してプロキシ公開する」ための各手法のメリット・デメリットを整理しました。
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
              m.recommended
                ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-rose-500/60 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500/40'
                : currentMode === m.id
                ? 'bg-slate-900/90 border-slate-700 ring-1 ring-slate-600'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  {m.recommended && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow mb-1.5">
                      <Sparkles className="w-3 h-3" /> おすすめ度 No.1
                    </span>
                  )}
                  <h4 className="font-bold text-sm text-slate-100">{m.name}</h4>
                </div>
              </div>

              {/* Specs Table */}
              <div className="space-y-2 py-3 border-y border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">ドメイン費用:</span>
                  <span className="text-emerald-400 font-bold font-mono">{m.domainCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ドメイン取得:</span>
                  <span className="text-slate-200">{m.domainNeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ルーターポート開放:</span>
                  <span className={m.routerPortForward.includes('不要') ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {m.routerPortForward}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">利用可能エリア:</span>
                  <span className="text-slate-300">{m.scope}</span>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="mt-3 space-y-1.5 text-[11px]">
                <div className="font-semibold text-emerald-400">メリット:</div>
                {m.pros.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-300">
                    <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
                <div className="font-semibold text-rose-400 pt-1">注意点:</div>
                {m.cons.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-400">
                    <X className="w-3 h-3 text-rose-400 flex-shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Select Button */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onSelectMode(m.id)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  currentMode === m.id
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>{currentMode === m.id ? '✓ 選択中' : 'この設定を採用する'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
