import { supabase } from '@/lib/supabase';
import { InvoicePrint } from '@/components/InvoicePrint';
import { notFound } from 'next/navigation';
import { PrintHeader } from '@/components/PrintHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPrintPage({ params }: PageProps) {
  const { id } = await params;

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PrintHeader />

      {/* Preview do recibo térmico */}
      <div className="py-8 flex justify-center print:p-0 print:m-0 print:block">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <InvoicePrint order={order} />
        </div>
      </div>
    </div>
  );
}
