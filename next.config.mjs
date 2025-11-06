/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com'],
    },
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://memome-delta.vercel.app" },
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Methods", value: "GET,POST,DELETE" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization,x-user-uid,x-project-host,x-refresh-csrf" },
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