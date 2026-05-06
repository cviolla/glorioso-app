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

const SEP = '------------------------------------------'; // Mais longo para 80mm

export function InvoicePrint({ order, mode = 'customer' }: { order: Order, mode?: 'customer' | 'kitchen' }) {
  const isKitchen = mode === 'kitchen';

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
    <div id="thermal-receipt" className={`thermal-receipt ${isKitchen ? 'kitchen-mode' : ''}`}>
      {/* Cabeçalho */}
      <div className="mb-6 border-b-4 border-double border-black pb-4 text-center">
        <p className="text-[28pt] leading-none font-black mb-1">
          {isKitchen ? '🍳 COZINHA' : 'GLORIOSO BROWNIE'}
        </p>
        <p className="text-[18pt] font-black">PEDIDO: #{order.id.slice(-6).toUpperCase()}</p>
        <p className="text-[16pt] font-bold">{formatDate(order.created_at)}</p>
      </div>

      {/* Dados do Cliente (Reduzido na cozinha) */}
      <div className="space-y-3 mb-6 text-[18pt] font-bold border-b-4 border-double border-black pb-4 text-left">
        <p><span className="font-black text-[15pt]">CLIENTE:</span> {order.customer_name.toUpperCase()}</p>
        <p><span className="font-black text-[15pt]">TIPO:</span> {order.delivery_type === 'delivery' ? 'DELIVERY' : 'RETIRADA'}</p>
        <p><span className="font-black text-[15pt]">PREVISÃO:</span> {order.order_time}</p>
        
        {!isKitchen && (
          <>
            <p><span className="font-black text-[15pt]">TEL:</span> {order.customer_phone}</p>
            {order.delivery_type === 'delivery' && (
              <div className="mt-3 pt-3 border-t-2 border-black/40">
                <p><span className="font-black text-[15pt]">END:</span> {order.address_street}, {order.address_number}</p>
                <p><span className="font-black text-[15pt]">BAIRRO:</span> {order.address_neighborhood}</p>
                {order.address_complement && <p><span className="font-black text-[15pt]">COMPL:</span> {order.address_complement}</p>}
                {order.address_reference && <p><span className="font-black text-[15pt]">REF:</span> {order.address_reference}</p>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Itens do Pedido */}
      <div className="mb-6 border-b-4 border-double border-black pb-4">
        <p className="text-center mb-4 text-[20pt] font-black underline uppercase tracking-tight">
          {isKitchen ? 'Itens para Preparo' : 'Resumo do Pedido'}
        </p>
        <div className="space-y-4">
          {order.items.map((item, idx) => {
            const itemTotal = (item.price + (item.addons?.reduce((s, a) => s + a.price, 0) || 0)) * item.quantity;
            return (
              <div key={idx} className={`${isKitchen ? 'text-[24pt]' : 'text-[18pt]'} font-bold`}>
                <div className="item-row items-start">
                  <span className="leading-tight text-left flex-1">
                    {item.quantity}x {item.name.toUpperCase()}{item.variant ? ` (${item.variant})` : ''}
                  </span>
                  {!isKitchen && <span className="font-black whitespace-nowrap ml-6">R${fmt(itemTotal)}</span>}
                </div>
                {item.addons?.map(a => (
                  <p key={a.name} className={`${isKitchen ? 'text-[20pt]' : 'text-[15pt]'} opacity-90 text-left pl-8 font-bold italic`}>  + {a.name}</p>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Totais e Pagamento (Apenas Cliente) */}
      {!isKitchen && (
        <>
          <div className="space-y-3 mb-6 border-b-4 border-double border-black pb-4">
            <div className="item-row text-[18pt] font-bold">
              <span>SUBTOTAL:</span>
              <span className="font-black">R${fmt(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="item-row text-[18pt] font-bold">
                <span>ENTREGA:</span>
                <span className="font-black">R${fmt(deliveryFee)}</span>
              </div>
            )}
            <div className="item-row text-[26pt] font-black mt-4 pt-3 border-t-4 border-black/30">
              <span className="underline italic">TOTAL:</span>
              <span>R${fmt(order.total_price)}</span>
            </div>
          </div>

          <div className="mb-8 text-[17pt] font-bold text-left">
            <p className="uppercase leading-snug border-l-[12px] border-black pl-4 py-3 bg-black/15">PAGAMENTO: {order.payment_method}</p>
          </div>
        </>
      )}

      {/* Observações (Sempre visível, mas com destaque extra na cozinha) */}
      {order.observation && (
        <div className={`mb-8 p-4 border-[6px] border-black rounded-2xl ${isKitchen ? 'bg-black text-white' : ''}`}>
          <p className={`${isKitchen ? 'text-[20pt]' : 'text-[17pt]'} leading-tight font-black underline mb-3 uppercase`}>OBSERVAÇÕES:</p>
          <p className={`${isKitchen ? 'text-[28pt]' : 'text-[19pt]'} leading-tight font-black`}>{order.observation}</p>
        </div>
      )}

      {/* Rodapé (Apenas Cliente) */}
      {!isKitchen ? (
        <div className="text-center mt-8 pb-20">
          <p className="text-[20pt] font-black uppercase tracking-[0.2em]">Obrigado pela preferência!</p>
          <p className="text-[16pt] font-bold mt-4 italic">gloriosobrownie.com.br</p>
          <p className="text-[26pt] mt-8 font-black tracking-tighter">. . . . . . . . . . . .</p>
        </div>
      ) : (
        <div className="text-center mt-8 pb-20">
          <p className="text-[24pt] font-black uppercase tracking-widest border-t-4 border-black pt-4">BOM TRABALHO!</p>
          <p className="text-[26pt] mt-8 font-black tracking-tighter">. . . . . . . . . . . .</p>
        </div>
      )}
    </div>
  );
}
