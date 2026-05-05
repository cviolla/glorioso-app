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
    }).replace(/[\u202f\u00a0]/g, ' ');
  };

  const fmt = (val: number) => val.toFixed(2).replace('.', ',');

  // Calculate subtotal from items
  const subtotal = order.items.reduce((sum, item) => {
    const itemTotal = item.price + (item.addons?.reduce((s, a) => s + a.price, 0) || 0);
    return sum + (itemTotal * item.quantity);
  }, 0);

  // Delivery fee = total_price - subtotal (if delivery)
  const deliveryFee = order.delivery_type === 'delivery' ? Math.max(0, order.total_price - subtotal) : 0;

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
        <div className="space-y-1">
          {order.items.map((item, idx) => {
            const itemTotal = (item.price + (item.addons?.reduce((s, a) => s + a.price, 0) || 0)) * item.quantity;
            return (
              <div key={idx} className="text-[13px] font-bold">
                <div className="item-row">
                  <span className="leading-tight text-left">{item.quantity}x {item.name.toUpperCase()}{item.variant ? ` (${item.variant})` : ''}</span>
                  <span className="font-black whitespace-nowrap">R${fmt(itemTotal)}</span>
                </div>
                {item.addons?.map(a => (
                  <p key={a.name} className="text-[11px] opacity-90 text-left">  + {a.name}</p>
                ))}
              </div>
            );
          })}
        </div>
        <p className="mt-2 font-bold text-[14px]">{SEP}</p>
      </div>

      {/* Totais */}
      <div className="space-y-1 mb-2">
        <div className="item-row text-[13px] font-bold">
          <span>SUBTOTAL:</span>
          <span className="font-black">R${fmt(subtotal)}</span>
        </div>
        {deliveryFee > 0 && (
          <div className="item-row text-[13px] font-bold">
            <span>ENTREGA:</span>
            <span className="font-black">R${fmt(deliveryFee)}</span>
          </div>
        )}
        <div className="item-row text-[16px] font-black mt-1">
          <span className="underline">TOTAL:</span>
          <span>R${fmt(order.total_price)}</span>
        </div>
        <p className="mt-1 font-bold text-[14px]">{SEP}</p>
      </div>

      {/* Pagamento e Observações */}
      <div className="mb-3 text-[12px] font-bold">
        <p className="uppercase leading-snug">PAGAMENTO: {order.payment_method}</p>
        {order.observation && (
          <div className="mt-2 p-1 border-2 border-black rounded-lg">
            <p className="text-[12px] leading-tight text-left">OBS: {order.observation}</p>
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
