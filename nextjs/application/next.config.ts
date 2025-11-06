import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    //output: 'export',
    reactStrictMode: false,
    swcMinify: false,
    trailingSlash: true,
    sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
    },
    experimental: {
        optimizePackageImports: ["@chakra-ui/react"],
    },
};

export default nextConfig;
