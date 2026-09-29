import React, { useState } from 'react';
import { Terminal, CheckCircle, Copy, Check, ChevronRight, AlertTriangle, Lightbulb, Shield, Globe, Cpu, ArrowRight } from 'lucide-react';
import { ProxyConfig } from '../types/proxy';

interface StepByStepGuideProps {
  config: ProxyConfig;
}

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ config }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const steps = [
    {
      phase: 'PHASE 1',
      title: 'まずはローカル環境で起動・動作確認（HTTP）',
      subtitle: 'Raspberry Pi 4BのターミナルでNode.jsプロキシをローカル起動し、同一Wi-Fiからテスト',
      time: '約3分',
      badge: 'ローカル検証',
      items: [
        {
          id: 'step-1-1',
          label: '1. Raspberry PiにSSH接続またはターミナルを開く',
          cmd: 'ssh pi@raspberrypi.local',
          explanation: '※ デフォルトユーザー名またはご自身で設定したユーザー名でログインします。'
        },
        {
          id: 'step-1-2',
          label: '2. 作業ディレクトリ作成 & Node.js プロキシファイルの配置',
          cmd: `mkdir -p ~/raspi-web-proxy && cd ~/raspi-web-proxy\ncat << 'EOF' > server.mjs\n// コード生成タブの「server.mjs」内容を貼り付け\nEOF`,
          explanation: '※ または「コード・設定生成」タブの setup.sh を実行すれば全自動で作成されます。'
        },
        {
          id: 'step-1-3',
          label: '3. プロキシサーバーを起動',
          cmd: `PORT=${config.port} node server.mjs`,
          explanation: '起動すると「🍓 Raspberry Pi 4B Proxy is ready!」とコンソールに出力されます。'
        },
        {
          id: 'step-1-4',
          label: '4. ローカルIPの確認 & ブラウザからテスト接続',
          cmd: 'hostname -I',
          explanation: `表示されたIP (例: 192.168.1.50) を使って、スマホやPCのブラウザから http://192.168.1.50:${config.port} にアクセス！`
        }
      ],
      notice: 'まずはHTTPの状態で「Webポータル画面」が表示され、URLを入力してアクセスできるか確認するのが確実な第一歩です。'
    },
    {
      phase: 'PHASE 2',
      title: 'ドメイン取得なし・無料でHTTPS化する設定',
      subtitle: '暗号化通信を行い、スマホやPCで「保護されていない通信」の警告を回避するベストな2つの選択肢',
      time: '約5分',
      badge: 'HTTPS化 (費用¥0)',
      subSections: [
        {
          title: '選択肢A: Cloudflare Tunnel【世界中から無料HTTPS・一番おすすめ】',
          desc: '独自ドメインを購入することなく、Cloudflareの無料インフラを使って本物のHTTPS URLを即座に発行。ルーターのポート開放も一切不要です。',
          commands: [
            {
              id: 'cf-1',
              label: 'cloudflared をRaspberry Pi 4B (ARM64) にインストール',
              cmd: 'curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb\nsudo dpkg -i cloudflared.deb'
            },
            {
              id: 'cf-2',
              label: 'Quick Tunnel で即座に無料HTTPS URLを発行・中継',
              cmd: `cloudflared tunnel --url http://localhost:${config.port}`,
              explanation: 'ターミナルに「https://xxxx-xxxx.trycloudflare.com」というURLが表示されます！このURLを世界中のスマホ・PCブラウザで開けば、自宅のRaspberry Piを経由したプロキシ通信が可能です。'
            }
          ]
        },
        {
          title: '選択肢B: mkcert【ローカルLAN専用・警告ゼロの完全SSL】',
          desc: '自宅Wi-Fi内だけで使う場合、mkcertを使ってローカル認証局（CA）を生成し、証明書警告なしでHTTPS接続できます。',
          commands: [
            {
              id: 'mk-1',
              label: 'mkcert のインストールと証明書発行',
              cmd: `sudo apt-get install -y libnss3-tools\ncurl -L -o mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-arm64\nchmod +x mkcert && sudo mv mkcert /usr/local/bin/\nmkcert -install\nmkdir -p certs\nmkcert -key-file certs/privkey.pem -cert-file certs/fullchain.pem localhost 127.0.0.1 $(hostname -I | awk '{print $1}')`
            },
            {
              id: 'mk-2',
              label: 'HTTPSモードでNode.jsを起動',
              cmd: `node server.mjs`
            }
          ]
        }
      ]
    },
    {
      phase: 'PHASE 3',
      title: 'Webサイトを開いてバイパス通信（中継）のテスト',
      subtitle: '開いた人の通信が本当にRaspberry PiのIPアドレスから発信されているか検証',
      time: '約2分',
      badge: 'バイパステスト',
      items: [
        {
          id: 'step-3-1',
          label: '1. ラズパイWebプロキシポータルを開く',
          cmd: config.sslMode === 'cloudflare_tunnel' ? 'https://your-tunnel.trycloudflare.com' : `https://${config.raspiLocalIp || '192.168.1.50'}:${config.port}`,
          explanation: 'ブラウザにWebプロキシの検索バーが表示されます。'
        },
        {
          id: 'step-3-2',
          label: '2. IP確認サイトで送信元IPを検証',
          cmd: 'https://httpbin.org/ip または https://ipinfo.io/json',
          explanation: '検索バーに入力して開くと、スマホのキャリア回線IPではなく、Raspberry Piが接続されている自宅回線のIPが表示されます。これで中継成功です！'
        }
      ],
      notice: 'HTML内のリンクや画像などの相対URLはプロキシエンジンが自動的にBase URLを補正して中継します。'
    },
    {
      phase: 'PHASE 4',
      title: '常時稼働（バックグラウンド＆再起動時自動実行）',
      subtitle: 'ターミナルを閉じても、ラズパイの電源が落ちて再起動しても常にプロキシが立ち上がるようにする',
      time: '約2分',
      badge: '常時稼働',
      items: [
        {
          id: 'step-4-1',
          label: 'systemd サービスファイルを登録して有効化',
          cmd: `sudo systemctl enable raspi-proxy\nsudo systemctl start raspi-proxy\nsudo systemctl status raspi-proxy`,
          explanation: 'Active: active (running) と緑色で表示されれば、常時デーモンとして稼働しています。'
        },
        {
          id: 'step-4-2',
          label: 'ログのリアルタイム確認コマンド',
          cmd: 'journalctl -u raspi-proxy -f',
          explanation: '通信ログやアクセス履歴をリアルタイムで監視できます。'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Hero Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Raspberry Pi 4B 完全対応ガイド
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              ドメイン不要＆完全無料HTTPS Webプロキシ構築ロードマップ
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              「まずはローカルで動かす」→「ドメインなしでHTTPS化」→「通信バイパスの確認」まで、4つのステップで迷わず構築できます。
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">総所要時間</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">約 10〜12 分</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">追加費用</div>
              <div className="text-sm font-bold text-rose-400 font-mono">¥ 0 (完全無料)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Container */}
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Phase Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-extrabold font-mono text-sm flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                      {step.phase}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                    {step.title}
                  </h3>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                ⏱️ 目安: {step.time}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 mb-4 leading-relaxed">
              {step.subtitle}
            </p>

            {/* Direct items */}
            {step.items && (
              <div className="space-y-3">
                {step.items.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                    <div className="font-semibold text-xs text-slate-200">
                      {item.label}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <code className="text-xs font-mono text-emerald-400 flex-1 overflow-x-auto whitespace-pre-wrap">
                        {item.cmd}
                      </code>
                      <button
                        onClick={() => copyText(item.cmd, item.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition-all flex items-center gap-1 flex-shrink-0"
                      >
                        {copiedCmd === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>OK</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    {item.explanation && (
                      <p className="text-[11px] text-slate-400 pl-1">
                        💡 {item.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* SubSections (like Option A vs Option B for HTTPS) */}
            {step.subSections && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {step.subSections.map((sub, sIdx) => (
                  <div key={sIdx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-rose-300 mb-1">
                        {sub.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                        {sub.desc}
                      </p>
                    </div>
                    <div className="space-y-2 mt-2">
                      {sub.commands.map((cmdItem) => (
                        <div key={cmdItem.id} className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-medium block">
                            {cmdItem.label}
                          </span>
                          <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-lg border border-slate-800">
                            <code className="text-[11px] font-mono text-emerald-400 flex-1 overflow-x-auto whitespace-pre-wrap">
                              {cmdItem.cmd}
                            </code>
                            <button
                              onClick={() => copyText(cmdItem.cmd, cmdItem.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 flex-shrink-0"
                            >
                              {copiedCmd === cmdItem.id ? 'OK' : 'Copy'}
                            </button>
                          </div>
                          {cmdItem.explanation && (
                            <div className="text-[10px] text-slate-400">
                              {cmdItem.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notice Footer */}
            {step.notice && (
              <div className="mt-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-2.5 text-xs text-slate-300">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-400">{step.notice}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
