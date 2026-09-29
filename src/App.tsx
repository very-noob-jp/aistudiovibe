import React, { useState } from 'react';
import { Header } from './components/Header';
import { SimpleBypassBrowser } from './components/SimpleBypassBrowser';
import { WebCurlBypass } from './components/WebCurlBypass';
import { StealthGuide } from './components/StealthGuide';
import { PacProxyGuide } from './components/PacProxyGuide';
import { ConfigGenerator } from './components/ConfigGenerator';
import { AntiBotLab } from './components/AntiBotLab';
import { StepByStepGuide } from './components/StepByStepGuide';
import { SslComparisonMatrix } from './components/SslComparisonMatrix';
import { TroubleshootingFaq } from './components/TroubleshootingFaq';
import { ProxyConfig, SslMode } from './types/proxy';

export default function App() {
  const [activeTab, setActiveTab] = useState<'browser' | 'curl_terminal' | 'wifi_pac' | 'stealth' | 'settings' | 'bot_lab' | 'guide' | 'comparison' | 'troubleshooting'>('browser');

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
      {/* Top Header Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        {/* Mode 1: Clean Interactive Web Browser with Utilities */}
        {activeTab === 'browser' && (
          <SimpleBypassBrowser
            config={config}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}

        {/* Mode 2: Web cURL Bypass Terminal */}
        {activeTab === 'curl_terminal' && (
          <WebCurlBypass />
        )}

        {/* Mode 3: Stealth Camouflage Architecture */}
        {activeTab === 'stealth' && (
          <StealthGuide config={config} />
        )}

        {/* Mode 4: Wi-Fi Proxy & PAC (Cisco Umbrella Bypass) */}
        {activeTab === 'wifi_pac' && (
          <PacProxyGuide config={config} />
        )}

        {/* Settings & Configuration Generator */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <ConfigGenerator
              config={config}
              setConfig={setConfig}
              onOpenLiveBrowser={() => setActiveTab('browser')}
            />
          </div>
        )}

        {/* Anti-Bot Explanation */}
        {activeTab === 'bot_lab' && (
          <AntiBotLab />
        )}

        {/* Step-by-Step Setup Guide */}
        {activeTab === 'guide' && (
          <StepByStepGuide config={config} />
        )}

        {/* SSL Comparison Matrix */}
        {activeTab === 'comparison' && (
          <SslComparisonMatrix
            currentMode={config.sslMode}
            onSelectMode={(mode: SslMode) => {
              setConfig(prev => ({ ...prev, sslMode: mode }));
              setActiveTab('settings');
            }}
          />
        )}

        {/* FAQ */}
        {activeTab === 'troubleshooting' && (
          <TroubleshootingFaq />
        )}
      </main>
    </div>
  );
}
