"use client";

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { InvoicePrint } from '@/components/InvoicePrint';
import { PrintHeader } from '@/components/PrintHeader';
import { Loader2 } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
  addons?: { name: string; price: number }[];
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: 'delivery' | 'pickup';
  address_street?: string;
  address_number?: string;
  address_neighborhood?: string;
  address_complement?: string;
  address_reference?: string;
  payment_method: string;
  order_time: string;
  observation?: string;
  total_price: number;
  items: OrderItem[];
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default function OrderPrintPage({ params, searchParams }: PageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const id = resolvedParams.id;
  const mode = resolvedSearchParams.mode;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError || !data) {
          console.error('Erro ao buscar pedido:', fetchError);
          setError(true);
        } else {
          setOrder(data);
        }
      } catch (err) {
        console.error('Erro de exceção ao buscar pedido:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#ff914a] animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Carregando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-black text-[var(--color-brand-dark)] mb-2">Pedido não encontrado</h1>
          <p className="text-gray-500 text-sm mb-6">Não foi possível carregar os dados para impressão. Verifique se o pedido ainda existe ou se você tem permissão.</p>
          <button 
            onClick={() => window.close()}
            className="w-full bg-[var(--color-brand-dark)] text-white py-3 rounded-xl font-black hover:bg-black transition-all"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    );
  }

  const printMode = mode === 'kitchen' ? 'kitchen' : 'customer';

  return (
    <div className="min-h-screen bg-gray-100">
      <PrintHeader />

      {/* Preview do recibo térmico */}
      <div className="py-8 flex justify-center print:p-0 print:m-0 print:block">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <InvoicePrint order={order as any} mode={printMode as any} />
        </div>
      </div>
    </div>
  );
}
