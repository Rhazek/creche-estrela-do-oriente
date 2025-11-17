/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile packages necessários
  transpilePackages: ['jspdf', 'canvg', 'core-js'],
  
  // Otimizações de build
  productionBrowserSourceMaps: false,
  
  // Configuração de compilação under demand
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  webpack: (config, { dev, isServer }) => {
    if (dev && process.platform === 'win32') {
      // Específico para Windows com unidades de rede
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**', '**/System Volume Information/**'],
        followSymlinks: false,
        stdin: false,
      };
      
      config.resolve = {
        ...config.resolve,
        symlinks: false,
        fallback: {
          ...config.resolve.fallback,
        },
      };
      
      config.infrastructureLogging = {
        level: 'error',
      };
      
      if (config.ignoreWarnings) {
        config.ignoreWarnings.push(
          { module: /node_modules/ },
          { message: /Can't resolve/ }
        );
      } else {
        config.ignoreWarnings = [
          { module: /node_modules/ },
          { message: /Can't resolve/ }
        ];
      }
    }
    
    return config;
  },
  
  // Headers de segurança
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig