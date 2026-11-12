/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O projeto é só API: a raiz leva para a documentação.
  async redirects() {
    return [{ source: '/', destination: '/api/docs', permanent: false }];
  },
};

module.exports = nextConfig;
