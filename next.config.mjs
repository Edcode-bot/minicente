/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
  // Allow @supabase/ssr (which uses process.version) to run in middleware
  experimental: {
    serverComponentsExternalPackages: ["@supabase/ssr"],
  },
};

export default nextConfig;
