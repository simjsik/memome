/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    // 개발 환경: localhost 허용
                    { key: "Access-Control-Allow-Origin", value: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "memome-delta.vercel.app" },
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS,PUT,DELETE" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "https://us-central1-meloudy-96af8.cloudfunctions.net/ApiRouter/:path*",
            },
        ];
    },
};


export default nextConfig;
