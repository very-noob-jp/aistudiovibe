export type SslMode = 
  | 'cloudflare_tunnel' // No domain needed, free HTTPS via Cloudflare Quick Tunnel / Zero Trust
  | 'mkcert_local'      // Local trusted SSL cert with mkcert (no warning on LAN)
  | 'duckdns_letsencrypt' // Free Dynamic DNS domain (*.duckdns.org) with Let's Encrypt
  | 'sslip_io'          // Magic wildcard DNS (e.g. 192-168-1-50.sslip.io)
  | 'self_signed';      // Self-signed certificate (for fast local dev)

export type AntiBotEngine = 
  | 'header_spoofing'   // Lightweight Node.js + full Sec-CH-UA / Sec-Fetch Chrome headers
  | 'puppeteer_chromium'// Real Chromium on RasPi (passes JavaScript & Cloudflare challenges)
  | 'stealth_proxy';    // Full Cookie Jar + Referer spoofing + Rate delay

export interface ProxyConfig {
  sslMode: SslMode;
  antiBotEngine: AntiBotEngine;
  browserProfile: 'chrome_desktop' | 'safari_iphone' | 'edge_desktop';
  port: number;
  enableAuth: boolean;
  username: string;
  password: string;
  enableAdblock: boolean;
  stripReferer: boolean;
  fakeUserAgent: boolean;
  duckDnsDomain: string;
  duckDnsToken: string;
  customDomain: string;
  raspiLocalIp: string;
  cloudflareTunnelName: string;
  autoStartService: boolean;
  enableWebSocket: boolean;
  enableCookieJar: boolean;
}

export interface ProxyFetchResult {
  success: boolean;
  statusCode?: number;
  statusMessage?: string;
  latencyMs?: number;
  url?: string;
  contentType?: string;
  headersSent?: Record<string, string>;
  headersReceived?: Record<string, string>;
  isBotBlocked?: boolean;
  botScore?: string;
  content?: string;
  error?: string;
}
