import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['sequelize', 'log4js'],
  /* config options here */
};

export default nextConfig;
