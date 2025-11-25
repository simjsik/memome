import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://memome-delta.vercel.app/', lastModified: new Date().toISOString() },
    { url: 'https://memome-delta.vercel.app/login', lastModified: new Date().toISOString() },
  ]
}