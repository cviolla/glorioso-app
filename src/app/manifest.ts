import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Glorioso Brownie',
    short_name: 'Glorioso',
    description: 'O Sabor Glorioso',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8ece3',
    theme_color: '#381010',
    icons: [
      {
        src: '/GloriosoBrownie_Logo_fuul.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/GloriosoBrownie_Logo_fuul.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/GloriosoBrownie_Logo_fuul.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
