import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Matched',
    short_name: 'Matched',
    description: 'Photograph your clothes once. Matched shows what pairs with what, and tells you why.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4efe6',
    theme_color: '#f4efe6',
    categories: ['lifestyle', 'shopping'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Add a piece', url: '/add', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Match', url: '/match', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Learn', url: '/learn', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
