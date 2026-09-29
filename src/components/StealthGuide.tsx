import React, { useState } from 'react';
import { Shield, Lock, Globe, EyeOff, FileText, Check, Copy, Sparkles, Server, Laptop, HelpCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ProxyConfig } from '../types/proxy';

interface StealthGuideProps {
  config: ProxyConfig;
}

export const StealthGuide: React.FC<StealthGuideProps> = ({ config }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: What makes it 99.9% Undetectable */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/40 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
          <EyeOff className="w-5 h-5 text-emerald-400" />
          <span>管理者に「ほぼ100%バレない」ステルス偽装化アーキテクチャ</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Cisco Umbrella や学校・企業のネットワーク管理者は、主に<strong>「怪しいドメイン名」「未暗号化通信」「目視によるWebページ確認」</strong>の3点で監視しています。<br />
          以下の4重ステルス防御を適用することで、ネットワークログ上は<strong>「完全に無害な学習用Techブログへのアクセス」</strong>にしか見えなくなります。
        </p>
      </div>

      {/* 4 Pillars of Stealth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: Custom Domain & Standard Port 443 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              ① 独自ドメイン化 ＆ 443番HTTPS標準ポート
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
              必須レベル
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <code>trycloudflare.com</code> や <code>8443</code> などの変則ポートではなく、<strong>無料の独自ドメイン（f5.si や MyDNS等）または数百円のドメイン</strong>をCloudflareに接続し、標準の <strong>443番（HTTPS）</strong> で通信します。
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
            <div className="text-slate-400 text-[11px]">推奨ドメイン命名例（無害に見える名称）：</div>
            <div className="text-emerald-400 font-semibold">docs.study-notes-lab.com</div>
            <div className="text-emerald-400 font-semibold">wiki.tech-research.f5.si</div>
          </div>
        </div>

        {/* Pillar 2: Camouflage Portal (ダミー学習ページ偽装) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              ② カモフラージュ・ダミー学習ポータル
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              目視監査対策
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            万が一管理者がURLを直接開いても、プロキシ画面ではなく<strong>「プログラミング学習ノート」</strong>が表示されます。秘密のキー（例: <code>/portal?key=raspi</code>）を入力した時だけプロキシが起動します。
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
            <div className="text-slate-400 text-[11px]">管理者が見た時の表示：</div>
            <div className="text-slate-300">「Python / Linux 技術研究ドキュメント」</div>
            <div className="text-amber-400 text-[11px]">裏URL: /proxy-stream?key=secret</div>
          </div>
        </div>

        {/* Pillar 3: Encrypted SNI / TLS 1.3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              ③ TLS 1.3 ＆ パケット内容の完全暗号化
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              DPI解析無効化
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            最新のTLS 1.3暗号化により、Wi-FiルーターやUmbrellaは「どのURLを閲覧しているか」「何のデータを送受信しているか」を1バイトも解読できません。
          </p>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            ✅ ヘッダー・Cookie・検索キーワードも全て暗号化保護
          </div>
        </div>

        {/* Pillar 4: Tailscale Mesh (究極の無痕跡通信) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ④ Tailscale P2P WireGuard (痕跡ゼロ)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              最高峰セキュリティ
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            ドメインすら使わず、WireGuardのP2Pトンネルで端末とRaspberry Piを直結。ポート41641/UDP経由でNAT越えするため、ファイアウォールログにも一切残りません。
          </p>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
            IP: 100.x.y.z (Tailscale内部専用IP)
          </div>
        </div>
      </div>

      {/* Step by Step Setup for Custom Domain */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          無料ドメインで Cloudflare 独自ドメイン化する手順 (約3分)
        </h3>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-start gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">1</span>
            <div>
              <strong>無料ドメインを取得する</strong>（例: <code>f5.si</code> や <code>MyDNS.jp</code>、または <code>Cloudflare Registrar</code> で年間数百円の <code>.xyz</code> / <code>.top</code> などを取得）。
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">2</span>
            <div>
              <strong>Cloudflare Zero Trust</strong>（無料）にログインし、<strong>「Networks」➔「Tunnels」</strong> で「Create a Tunnel」を選択。
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">3</span>
            <div>
              画面に表示される <code>cloudflared service install &lt;トークン&gt;</code> をRaspberry Piで実行し、Public Hostnameに取得した独自ドメイン（例: <code>docs.yourname.f5.si</code>）と <code>http://127.0.0.1:8443</code> を指定。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
