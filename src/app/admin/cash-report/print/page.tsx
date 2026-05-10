"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CashReportPrint } from '@/components/CashReportPrint';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CashReportPrintPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const sessionStart = searchParams.get('session_start');
        const sessionEnd = searchParams.get('session_end');
        const dateParam = searchParams.get('date');
        const today = dateParam || new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        let query = supabase
          .from('orders')
          .select('id, created_at, customer_name, total_price, payment_method, status')
          .eq('status', 'delivered')
          .order('created_at', { ascending: false });

        if (sessionStart) {
          query = query.gte('created_at', sessionStart);
        }
        if (sessionEnd) {
          query = query.lte('created_at', sessionEnd);
        }

        const { data, error } = await query;

        if (error) throw error;

        let filteredOrders = data || [];
        
        if (!sessionStart) {
          filteredOrders = filteredOrders.filter(o =>
            new Date(o.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) === today
          );
        }

        const totals: Record<string, number> = {};
        let total = 0;

        filteredOrders.forEach(o => {
          const method = o.payment_method || 'Outros';
          const value = Number(o.total_price) || 0;
          totals[method] = (totals[method] || 0) + value;
          total += value;
        });

        setReportData({
          date: sessionStart 
            ? `Caixa Aberto: ${new Date(sessionStart).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}` 
            : today,
          totals,
          total,
          count: filteredOrders.length,
          items: filteredOrders
        });
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#ff914a] animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Erro ao carregar dados do relatório.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header igual ao PrintHeader dos pedidos */}
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

      {/* Preview do relatório térmico */}
      <div className="py-8 flex justify-center print:p-0 print:m-0 print:block">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <CashReportPrint data={reportData} />
        </div>
      </div>
    </div>
  );
}
