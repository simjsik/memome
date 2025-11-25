import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://memome-delta.vercel.app/'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/home/bookmark',
          '/api/*',         // API 엔드포인트 제외
          '/_next/*',       // Next.js 내부 파일 제외
          '/static/*',      // 정적 파일 제외
        ],
      }
    ],
    sitemap: 'https://memome-delta.vercel.app/sitemap.xml',
    host: baseUrl,
  }
}