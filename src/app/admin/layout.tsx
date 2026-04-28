import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';

export const metadata = {
  title: "Admin",
  description: "Painel Administrativo - Glorioso Brownie",
  icons: {
    icon: "/admin-icon.png",
    apple: "/admin-icon.png",
  },
  openGraph: {
    title: 'Admin | Glorioso Brownie',
    description: 'Acesso restrito ao painel de gestão do Glorioso Brownie.',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminSidebar>
      {children}
    </AdminSidebar>
  );
}
