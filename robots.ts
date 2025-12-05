import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/home/bookmark',
        },
        sitemap: 'https://memome-delta.vercel.app/sitemap.xml',
    }
}