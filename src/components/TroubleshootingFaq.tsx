import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, AlertCircle, ShieldAlert, Wifi, Terminal, RefreshCw, Key } from 'lucide-react';

export const TroubleshootingFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Q1. 自宅のインターネットが「DS-Lite / MAP-E (V6プラス/IPv6 IPoE)」でポート開放できません。どうすればいいですか？',
      a: '日本の光回線（transix、v6プラス、OCNバーチャルコネクトなど）では、グローバルIPv4アドレスが共有されているため、ルーターで80番や443番ポートを開放できません。この場合は【Cloudflare Tunnel (cloudflared)】を使用するのが最適解です。Cloudflare TunnelはRaspberry Piから外向きに常時接続を確立するため、ポート開放やCGNAT制限を完全無視して無料HTTPSで外部アクセスできます。'
    },
    {
      q: 'Q2. 「保護されていない通信」「プライバシーが保護されていません」と出る理由と対策は？',
      a: '自己署名証明書（Self-Signed）やIPアドレス直打ちの場合にブラウザのセキュリティ機能が警告を出します。解決策は以下のいずれかです：\n1. Cloudflare Tunnelを使用する（正規のCloudflare SSLが自動適用され、警告なしになります）。\n2. ローカルLAN内なら「mkcert」を使ってRaspberry Pi内でローカル認証局を作り、証明書を発行する。'
    },
    {
      q: 'Q3. Webプロキシで一部のWebサイトの画像やCSSが崩れたり、リンクをクリックすると元のサイトに飛んでしまうのはなぜ？',
      a: 'Webサイト内のリンクが絶対パス（例: href="/css/style.css"）で書かれていると、クライアントのブラウザがプロキシではなく自身のURLへリクエストを送ってしまうためです。当ツールの「server.mjs」では、レスポンスのHTMLの<head>内に「<base href="元のサイトURL">」を自動注入することで、画像やスタイルシートが壊れないよう補正しています。'
    },
    {
      q: 'Q4. サイトを開いた人の通信が本当にRaspberry Piを経由（バイパス）しているか確認するには？',
      a: 'プロキシ経由で「https://httpbin.org/ip」または「https://ipinfo.io/json」を開いてください。\nスマホの4G/5G回線からアクセスしているにもかかわらず、画面に表示されるIPアドレスが「Raspberry Piが接続されている自宅Wi-Fi/光回線のIPアドレス」になっていれば、すべての通信がRasPi 4Bを経由して中継されています。'
    },
    {
      q: 'Q5. パスワードを設定して、自分以外の人に使われないようにしたい',
      a: '設定画面の「Basic 認証パスワード保護」をONにしてください。生成される server.mjs にBasic認証機能が組み込まれ、ブラウザで開いた際にユーザー名とパスワードの入力を要求されるようになります。'
    },
    {
      q: 'Q6. Raspberry Pi 4Bのスペックで何人くらい同時アクセスできますか？',
      a: 'Raspberry Pi 4B（4GB/8GB RAM）はギガビットイーサネットを搭載しており、Node.jsの非同期I/O処理により、個人利用〜数十人規模の同時Webプロキシ通信であればCPU負荷数%〜10%程度で非常に軽快に動作します。'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5 text-rose-400" />
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            よくある質問とトラブルシューティング (FAQ)
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Raspberry Pi 4BでWebプロキシやHTTPSサーバーを構築する際によく遭遇する問題と解決手順です。
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all shadow-md"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-100 hover:bg-slate-800/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-rose-400 font-mono text-xs">#{idx + 1}</span>
                  <span>{faq.q}</span>
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 bg-slate-950/50 whitespace-pre-line">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
