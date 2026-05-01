import React from 'react';

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

const SEP = '================================';

export function InvoicePrint({ order }: { order: Order }) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div id="thermal-receipt" className="thermal-receipt">
      {/* Cabeçalho */}
      <div className="mb-2">
        <p className="text-[16px] leading-tight font-black">GLORIOSO BROWNIE</p>
        <p className="text-[12px] mt-1 font-bold">PEDIDO: #{order.id.slice(-6).toUpperCase()}</p>
        <p className="text-[12px] font-bold">{formatDate(order.created_at)}</p>
        <p className="mt-1 font-bold text-[14px]">{SEP}</p>
      </div>

      {/* Dados do Cliente */}
      <div className="space-y-1 mb-2 text-[13px] font-bold">
        <p>CLIENTE: {order.customer_name.toUpperCase()}</p>
        <p>TEL: {order.customer_phone}</p>
        <p>TIPO: {order.delivery_type === 'delivery' ? 'DELIVERY' : 'RETIRADA'}</p>
        <p>PREVISÃO: {order.order_time}</p>
        
        {order.delivery_type === 'delivery' && (
          <div className="mt-1">
            <p>END: {order.address_street}, {order.address_number}</p>
            <p>BAIRRO: {order.address_neighborhood}</p>
            {order.address_complement && <p>COMPL: {order.address_complement}</p>}
            {order.address_reference && <p>REF: {order.address_reference}</p>}
          </div>
        )}
        <p className="mt-1 font-bold text-[14px]">{SEP}</p>
      </div>

      {/* Itens do Pedido */}
      <div className="mb-2">
        <p className="text-center mb-1 text-[14px] font-black underline">RESUMO DO PEDIDO</p>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="text-[13px] font-bold">
              <div className="flex flex-col items-center">
                <span className="leading-tight">{item.quantity}x {item.name.toUpperCase()}</span>
                <span className="font-black">R${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              {item.variant && <p className="text-[11px] opacity-90">• {item.variant}</p>}
              {item.addons?.map(a => (
                <p key={a.name} className="text-[11px] opacity-90">+ {a.name}</p>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-2 font-bold text-[14px]">{SEP}</p>
      </div>

      {/* Totais */}
      <div className="space-y-1 mb-2">
        <div className="flex flex-col items-center text-[13px] font-bold">
          <span>SUBTOTAL:</span>
          <span className="font-black text-[15px]">R${order.total_price.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center text-[16px] font-black mt-1">
          <span className="underline">TOTAL:</span>
          <span className="text-[18px]">R${order.total_price.toFixed(2)}</span>
        </div>
        <p className="mt-1 font-bold text-[14px]">{SEP}</p>
      </div>

      {/* Pagamento e Observações */}
      <div className="mb-3 text-[13px] font-bold">
        <p className="uppercase">PAGAMENTO: {order.payment_method}</p>
        {order.observation && (
          <div className="mt-2 p-1 border-2 border-black rounded-lg">
            <p className="text-[12px] leading-tight">OBS: {order.observation}</p>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="text-center mt-3 pb-8">
        <p className="text-[12px] font-black uppercase tracking-wider">Obrigado pela preferência!</p>
        <p className="text-[11px] font-bold mt-1">gloriosobrownie.com.br</p>
        <p className="text-[14px] mt-2 font-bold">. . . . . . . . . . . .</p>
      </div>
    </div>
  );
}
