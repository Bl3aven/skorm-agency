import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // V2 PROD : l'application sert TOUT elle-même (vitrine + API + backoffice).
  // Plus de rewrites/redirects vers skorm-agency.com (supprimés le 22/10/2026).
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-SKORM-Frontend", value: "skorm-v2-prod-20261022" }] }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "is1-ssl.mzstatic.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "i1.sndcdn.com" },
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Build sur hébergement mutualisé (CageFS plafonne les processus enfants) :
  // limiter les workers pour que `next build` aboutisse sans EAGAIN/EPERM.
  // (validé sur o2switch — mat1concept)
  output: "standalone",
  experimental: {
    cpus: 1,
    workerThreads: false,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 100,
  },
};

export default nextConfig;
