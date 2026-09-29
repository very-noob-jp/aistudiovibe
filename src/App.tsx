import React, { useState } from 'react';
import { Header } from './components/Header';
import { LiveBypassBrowser } from './components/LiveBypassBrowser';
import { ConfigGenerator } from './components/ConfigGenerator';
import { AntiBotLab } from './components/AntiBotLab';
import { StepByStepGuide } from './components/StepByStepGuide';
import { SslComparisonMatrix } from './components/SslComparisonMatrix';
import { TroubleshootingFaq } from './components/TroubleshootingFaq';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { ProxyConfig, SslMode } from './types/proxy';

export default function App() {
  const [activeTab, setActiveTab] = useState<'bypass_browser' | 'settings' | 'bot_lab' | 'guide' | 'comparison' | 'troubleshooting'>('bypass_browser');

  const [config, setConfig] = useState<ProxyConfig>({
    sslMode: 'cloudflare_tunnel',
    antiBotEngine: 'header_spoofing',
    browserProfile: 'chrome_desktop',
    port: 8443,
    enableAuth: false,
    username: 'admin',
    password: 'raspi' + Math.floor(1000 + Math.random() * 9000),
    enableAdblock: true,
    stripReferer: true,
    fakeUserAgent: true,
    duckDnsDomain: 'my-raspi-proxy',
    duckDnsToken: '',
    customDomain: '',
    raspiLocalIp: '192.168.1.50',
    cloudflareTunnelName: 'raspi-web-proxy',
    autoStartService: true,
    enableWebSocket: true,
    enableCookieJar: true
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real Live Bypass Browser (Primary User Access View) */}
        {activeTab === 'bypass_browser' && (
          <div className="space-y-6">
            <LiveBypassBrowser config={config} onOpenSettings={() => setActiveTab('settings')} />
            <ArchitectureDiagram config={config} />
          </div>
        )}

        {/* Settings & NPM Package Generator */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <ConfigGenerator
              config={config}
              setConfig={setConfig}
              onOpenLiveBrowser={() => setActiveTab('bypass_browser')}
            />
            <ArchitectureDiagram config={config} />
          </div>
        )}

        {/* Anti-Bot Explanation & Verification Lab */}
        {activeTab === 'bot_lab' && (
          <AntiBotLab />
        )}

        {/* Step-by-Step Installation Guide */}
        {activeTab === 'guide' && (
          <StepByStepGuide config={config} />
        )}

        {/* SSL Options Comparison */}
        {activeTab === 'comparison' && (
          <SslComparisonMatrix
            currentMode={config.sslMode}
            onSelectMode={(mode: SslMode) => {
              setConfig(prev => ({ ...prev, sslMode: mode }));
              setActiveTab('settings');
            }}
          />
        )}

        {/* Troubleshooting & FAQ */}
        {activeTab === 'troubleshooting' && (
          <TroubleshootingFaq />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-12 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span className="font-semibold text-slate-300">Raspberry Pi 4B HTTPS Bypass Proxy Suite</span>
            <span className="text-slate-400">|</span>
            <span>npm start / Anti-Bot Client Hints / Cloudflare Tunnel</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Node.js 20 LTS • ARM64 Chromium • Express Full-Stack
          </div>
        </div>
      </footer>
    </div>
  );
}
