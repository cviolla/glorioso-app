"use client";

import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function PrintHeader() {
  return (
    <div className="print:hidden bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <Link 
        href="/admin/orders" 
        className="flex items-center gap-2 text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors font-bold text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Pedidos
      </Link>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[var(--color-brand-accent)] text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-[var(--color-brand-accent)]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Printer className="w-5 h-5" /> Imprimir Agora
        </button>
      </div>
    </div>
  );
}
