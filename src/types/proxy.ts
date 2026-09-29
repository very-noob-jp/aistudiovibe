export type SslMode = 
  | 'cloudflare_tunnel'   // Cloudflare Quick Tunnel (*.trycloudflare.com)
  | 'cf_custom_domain'    // Cloudflare Tunnel + 独自ドメイン (検閲完全回避)
  | 'tailscale_vpn'       // Tailscale WireGuard VPN (学校・職場の検閲を100%すり抜けるP2P暗号化)
  | 'pinggy_tunnel'       // Pinggy SSH HTTPS Tunnel (登録不要・ワンライナーで即時別ドメイン公開)
  | 'duckdns_letsencrypt' // Free Dynamic DNS (*.duckdns.org) with Let's Encrypt
  | 'mkcert_local'        // Local trusted SSL cert with mkcert (LAN内)
  | 'sslip_io'            // Magic wildcard DNS (e.g. 192-168-1-50.sslip.io)
  | 'self_signed';        // Self-signed certificate

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
  cloudflareToken?: string;
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
