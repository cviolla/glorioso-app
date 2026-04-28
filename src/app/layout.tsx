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
  title: "Glorioso Brownie",
  description: "Peça seu lanche online - Glorioso Brownie",
  icons: {
    icon: "/GB2.png",
    apple: "/GB2.png",
  }
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
