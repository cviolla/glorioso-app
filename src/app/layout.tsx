import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Glorioso Brownie | O Melhor Brownie Artesanal de Caxias",
    template: "%s | Glorioso Brownie"
  },
  description: "Brownies artesanais, molhadinhos e com casquinha crocante. Peça agora pelo nosso cardápio online e receba em casa. O sabor que você merece!",
  keywords: ["brownie artesanal", "glorioso brownie", "doce em duque de caxias", "delivery de brownie", "brownie recheado", "sobremesa"],
  authors: [{ name: "Glorioso Brownie" }],
  creator: "Glorioso Brownie",
  publisher: "Glorioso Brownie",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gloriosobrownie.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Glorioso Brownie | Cardápio Online',
    description: 'Brownies artesanais feitos com amor. Peça agora e experimente o sabor glorioso!',
    url: 'https://gloriosobrownie.com.br',
    siteName: 'Glorioso Brownie',
    images: [
      {
        url: '/GloriosoBrownie_Logo_fuul.png',
        width: 800,
        height: 800,
        alt: 'Logo Glorioso Brownie',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glorioso Brownie | Cardápio Online',
    description: 'O melhor brownie artesanal direto na sua casa.',
    images: ['/GloriosoBrownie_Logo_fuul.png'],
  },
  icons: {
    icon: "/GloriosoBrownie_Logo_fuul.png",
    apple: "/GloriosoBrownie_Logo_fuul.png",
  },
  themeColor: '#381010',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] pb-20`}>
        {children}
      </body>
    </html>
  );
}
