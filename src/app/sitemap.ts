import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://memome-delta.vercel.app/login',
            lastModified: new Date(),
        },
        {
            url: 'https://memome-delta.vercel.app/home/main',
            lastModified: new Date(),
        },
        {
            url: 'https://memome-delta.vercel.app/home/notice',
            lastModified: new Date(),
        },
    ]
}