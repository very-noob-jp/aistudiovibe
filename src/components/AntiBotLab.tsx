import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Laptop, Terminal, Sparkles, Check, X, AlertTriangle, ArrowRight, Zap, Code } from 'lucide-react';

export const AntiBotLab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100">
            「コマンド取得だとBot認定される問題」の原因とRaspberry Piでの解決策
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-4xl">
          Webサイト（Cloudflare、Akamai、各大手サイト）は、単なる <code className="text-rose-400 font-mono">curl</code> や簡易コマンドでのHTML取得を**「スクレイピングBot」**として検知し、アクセス拒否（403 Forbidden）やBot判定画面を表示します。Raspberry Pi 4Bでは、以下の多層アプローチで「本物の人間がブラウザで調べた」ように見せかけます。
        </p>
      </div>

      {/* Comparison: curl vs RasPi Synthesizer vs RasPi Chromium */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Method 1: Naive curl (Blocked) */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-rose-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                ❌ 簡易コマンド (即ブロック)
              </span>
              <Terminal className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 mb-1">
              curl / wget / 簡易fetch
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              ブラウザ特有のヘッダーが一切なく、JavaScriptも実行できないため即座にBot認定されます。
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 text-rose-400 text-[11px] border border-slate-800">
                • User-Agent: curl/7.88.1<br />
                • Sec-CH-UA なし (致命的)<br />
                • Accept-Language なし<br />
                • JS チャレンジ実行不可
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-rose-400 font-semibold flex items-center gap-1">
            <X className="w-3.5 h-3.5" />
            <span>判定結果: 403 Forbidden / Cloudflareブロック</span>
          </div>
        </div>

        {/* Method 2: Node.js Header Synthesizer (Fast & 95% pass) */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✨ 推奨: ヘッダー完全偽装 (高速)
              </span>
              <Laptop className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 mb-1">
              Node.js Client Hints 合成
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              最新のChrome/Safariと同じ <code className="text-sky-300">Sec-CH-UA</code>、<code className="text-sky-300">Sec-Fetch-Mode</code>、日本語ロケールをRaspberry Piから送信。
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 text-emerald-300 text-[11px] border border-slate-800 space-y-1">
                <div>• Sec-CH-UA: "Chromium";v="124"</div>
                <div>• Sec-Fetch-Dest: document</div>
                <div>• Accept-Language: ja,en-US</div>
                <div>• Brotli / Gzip 圧縮展開</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>判定結果: 一般Web・Wikipedia・ニュース完全通過</span>
          </div>
        </div>

        {/* Method 3: Real Chromium on RasPi (100% JS Pass) */}
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-sky-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                🦾 究極: 本物のChromium実行
              </span>
              <Cpu className="w-4 h-4 text-sky-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 mb-1">
              Puppeteer + ARM64 Chromium
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Raspberry Pi 4B内部で本物のChromiumブラウザをバックグラウンド起動。JavaScriptや難関認証を完全に実行。
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 text-sky-300 text-[11px] border border-slate-800 space-y-1">
                <div>• 本物のChromiumエンジン</div>
                <div>• JavaScript・DOM完全実行</div>
                <div>• Cloudflare Turnstile 突破</div>
                <div>• Cookie & LocalStorage保持</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-sky-400 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>判定結果: 難関SPA・動的サイトも100%人間認定</span>
          </div>
        </div>
      </div>

      {/* Deep-Dive Tech Details */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Webサイトが「人間かBotか」を判定する4大チェック項目
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-rose-300 text-xs">1. Client Hints (Sec-CH-UA)</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              2022年以降、Google Chromeは従来のUser-Agentに加え、<code className="text-slate-200">Sec-CH-UA</code> ヘッダーを送信するようになりました。curlやスクレイパーの多くはこれを送信しないため、Bot判定の最重要フラグになっています。当ツールのプロキシはこれを自動合成します。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-rose-300 text-xs">2. Sec-Fetch ナビゲーションコンテキスト</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              ブラウザでユーザーがURLバーに打ち込んだ場合、<code className="text-slate-200">Sec-Fetch-Mode: navigate</code> と <code className="text-slate-200">Sec-Fetch-Dest: document</code> が必ず付与されます。これを再現することで、相手サーバーは「人間が能動的に開いた」と認識します。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-rose-300 text-xs">3. ロケールと自然な言語優先度</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              日本のユーザーが調べたように見せるため、<code className="text-slate-200">Accept-Language: ja,en-US;q=0.9,en;q=0.8</code> を設定。海外のスクレイピングサーバー特有の無指定や英語オンリーを回避します。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-rose-300 text-xs">4. 相対パス & Cookieセッション補正</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              取得したHTML内の画像・CSS・JavaScriptが壊れないよう、<code className="text-slate-200">&lt;base href="..."&gt;</code> タグを自動注入。さらにSet-CookieヘッダーのDomain属性を適切に処理してログインやセッションを維持します。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
