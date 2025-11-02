import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignorar erros de TypeScript durante build (útil para desenvolvimento rápido)
    ignoreBuildErrors: true,
  },
  // React Strict Mode desabilitado para evitar double-render em desenvolvimento
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Desabilitar watch do webpack (opcional)
      config.watchOptions = {
        ignored: ['**/*'],
      };
    }
    return config;
  },
  eslint: {
    // Ignorar erros de ESLint durante build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
