import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Quntem Device Manager',
    short_name: 'Device Manager',
    description: 'Easily provision thetaOS devices',
    start_url: '/devicemanager',
    scope: '/devicemanager/',
    id: 'uk.co.quntem.devicemanager',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/devicemanager.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}