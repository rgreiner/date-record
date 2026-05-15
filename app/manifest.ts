import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Melhores Encontros',
    short_name: 'Encontros',
    description: 'Organize seus dates e descubra quem tem mais conexão com você.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf6f0',
    theme_color: '#faf6f0',
    orientation: 'portrait-primary',
    categories: ['lifestyle', 'social'],
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
