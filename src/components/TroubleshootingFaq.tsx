import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, AlertCircle, ShieldAlert, Wifi, Terminal, RefreshCw, Key, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, Zap, Globe, Lock } from 'lucide-react';

export const TroubleshootingFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Q1. 【重要】「*.trycloudflare.com」自体が学校や職場のWi-Fiで検閲・ブロックされています。回避する方法は？',
      a: `学校や大学、企業のファイアウォール（i-Filter、FortiGuard、Palo Alto、Cisco Umbrella等）は、無料の使い捨てトンネルドメインである「*.trycloudflare.com」全体を一括で「高リスク/トンネリング」としてブラックリスト登録していることが多いためです。

この検閲は以下のいずれかの方法で100%回避できます：

【回避策①: Pinggy SSHトンネルを使う（追加インストール不要・最速）】
Raspberry Piで以下を実行するだけで、ブロックされていない「*.pinggy.link」ドメインの正規HTTPSが即時発行されます：
\`ssh -p 443 -R0:localhost:8443 a.pinggy.io\`

【回避策②: Tailscale メッシュVPNを使う（完全無敵の検閲回避）】
WireGuardベースのTailscaleなら、URLドメインでの検閲が一切効きません。
Raspberry Piとスマホの両方にTailscaleを入れて接続すると、プライベートIP（http://100.x.y.z:8443）で直結できます：
\`curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up\`

【回避策③: Cloudflare Zero Trustで独自ドメインを当てる】
無料ドメイン（.f5.siなど）や格安独自ドメインを取得してCloudflare Tunnelに紐付けると、ブロック対象の「trycloudflare.com」ではなく「your-name.com」でアクセスできるためフィルタに引っかかりません。`
    },
    {
      q: 'Q2. 【502 Bad Gateway】「dial tcp [::1]:8443: connect: connection refused」と出る原因と直し方は？',
      a: `このエラーには原因が2つあります：

【原因①: Node.js サーバー（npm start）が別画面で起動していない】
Cloudflare Tunnel (cloudflared) は「自宅のRaspberry Piで動いているWebサーバーに転送する」ツールです。
転送先である \`node server.mjs\`（または \`npm start\`）が起動していないと、接続を拒否（connection refused）され502エラーになります。
👉 【解決策】: ターミナルを2つ開くか、バックグラウンド起動してください：
   ・ターミナル1: \`npm start\` （または \`node server.mjs\`）
   ・ターミナル2: \`npm run tunnel\` （または \`cloudflared tunnel --url http://127.0.0.1:8443\`）

【原因②: IPv6 [::1] と IPv4 の競合】
cloudflared が \`localhost\` をIPv6の \`[::1]\` として解決してしまい、IPv4で待機しているNode.jsと通信できない場合があります。
👉 【解決策】: \`localhost\` ではなく \`127.0.0.1\` を指定してトンネルを起動します：
   \`cloudflared tunnel --url http://127.0.0.1:8443\``
    },
    {
      q: 'Q3. 自宅のインターネットが「DS-Lite / MAP-E (V6プラス/IPv6 IPoE)」でポート開放できません。どうすればいいですか？',
      a: '日本の光回線（transix、v6プラス、OCNバーチャルコネクトなど）では、グローバルIPv4アドレスが共有されているため、ルーターで80番や443番ポートを開放できません。この場合は【Cloudflare Tunnel】または【Tailscale】【Pinggy】を使用するのが最適解です。Raspberry Piから外向きに常時接続を確立するため、ポート開放やCGNAT制限を完全無視して無料HTTPSで外部アクセスできます。'
    },
    {
      q: 'Q4. 「保護されていない通信」「プライバシーが保護されていません」と出る理由と対策は？',
      a: '自己署名証明書（Self-Signed）やIPアドレス直打ちの場合にブラウザのセキュリティ機能が警告を出します。解決策は以下のいずれかです：\n1. Cloudflare TunnelまたはPinggyを使用する（正規のSSLが自動適用され、警告なしになります）。\n2. ローカルLAN内なら「mkcert」を使ってRaspberry Pi内でローカル認証局を作り、証明書を発行する。'
    },
    {
      q: 'Q5. Webプロキシで一部のWebサイトの画像やCSSが崩れたり、リンクをクリックすると元のサイトに飛んでしまうのはなぜ？',
      a: 'Webサイト内のリンクが絶対パス（例: href="/css/style.css"）で書かれていると、クライアントのブラウザがプロキシではなく自身のURLへリクエストを送ってしまうためです。当ツールの「server.mjs」では、レスポンスのHTMLの<head>内に「<base href="元のサイトURL">」を自動注入することで、画像やスタイルシートが壊れないよう補正しています。'
    },
    {
      q: 'Q6. サイトを開いた人の通信が本当にRaspberry Piを経由（バイパス）しているか確認するには？',
      a: 'プロキシ経由で「https://httpbin.org/ip」または「https://ipinfo.io/json」を開いてください。\nスマホの4G/5G回線からアクセスしているにもかかわらず、画面に表示されるIPアドレスが「Raspberry Piが接続されている自宅Wi-Fi/光回線のIPアドレス」になっていれば、すべての通信がRasPi 4Bを経由して中継されています。'
    },
    {
      q: 'Q7. パスワードを設定して、自分以外の人に使われないようにしたい',
      a: '設定画面の「Basic 認証パスワード保護」をONにしてください。生成される server.mjs にBasic認証機能が組み込まれ、ブラウザで開いた際にユーザー名とパスワードの入力を要求されるようになります。'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Censorship Solution Callout Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
          <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
          <span>trycloudflare.com 自体が検閲・ブロックされている場合の回避策</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          学校・企業・公共Wi-Fiのフィルタリング装置（i-Filter等）は、無料ドメイン「<code>*.trycloudflare.com</code>」全体を一括ブロックすることがあります。以下の<strong>2つの代替手段</strong>で100%すり抜けが可能です：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sky-400 font-bold flex items-center gap-1.5 font-sans">
                <Zap className="w-3.5 h-3.5" />
                手段1: Pinggy (別ドメインHTTPS・即時)
              </span>
              <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">
                追加ソフト不要
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Raspberry Piで以下を実行するだけでブロック対象外のURL（*.pinggy.link）が即発行：
            </p>
            <code className="text-[11px] text-sky-300 block bg-slate-900 p-2 rounded border border-slate-800 font-mono">
              ssh -p 443 -R0:localhost:8443 a.pinggy.io
            </code>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-sans">
                <ShieldCheck className="w-3.5 h-3.5" />
                手段2: Tailscale (WireGuard P2P VPN)
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                完全検閲回避
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              スマホとRasPiを直接暗号化メッシュ接続（DNSやドメインブロック完全無効化）：
            </p>
            <code className="text-[11px] text-emerald-300 block bg-slate-900 p-2 rounded border border-slate-800 font-mono">
              curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up
            </code>
          </div>
        </div>
      </div>

      {/* FAQ Header */}
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
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-100 hover:bg-slate-800/50 transition-colors cursor-pointer"
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
