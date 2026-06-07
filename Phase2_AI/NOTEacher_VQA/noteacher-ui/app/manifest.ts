// src/app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NOTEacher VQA Engine',
    short_name: 'NOTEacher',
    description: 'Autonomous Agentic Math Assistant',
    start_url: '/',
    display: 'standalone', // THIS IS CRITICAL: It hides the Safari/Chrome address bar!
    background_color: '#0f172a', // Tailwind slate-950
    theme_color: '#2563eb', // Tailwind blue-600
    icons: [
      {
        src: '/icon-192x192.png', // You will need to add a basic square PNG to your /public folder!
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
