/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  serverExternalPackages: ['mongoose'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        child_process: false,
        'timers/promises': false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        http: false,
        https: false,
        zlib: false,
        events: false,
        buffer: false,
        util: false,
        url: false,
        assert: false,
        querystring: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
