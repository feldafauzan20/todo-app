declare module "next-pwa" {
  import { NextConfig } from "next";

  type PWAConfig = {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: any[];
  };

  type WithPWAConfig = NextConfig & {
    pwa?: PWAConfig;
  };

  function withPWA(config: WithPWAConfig): NextConfig;

  export = withPWA;
}
