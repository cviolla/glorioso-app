import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminSidebar>
      {children}
    </AdminSidebar>
  );
}
