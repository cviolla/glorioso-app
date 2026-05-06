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

  const SEP_LINE = "================================";
  
  return (
    <div id="thermal-receipt" className={`thermal-receipt ${isKitchen ? 'kitchen-mode' : ''} font-black`}>
      {/* Cabeçalho */}
      <div className="mb-2 pb-1 text-center">
        <p className="text-[11pt] leading-none mb-1">
          {isKitchen ? '🍳 COZINHA' : 'GLORIOSO BROWNIE'}
        </p>
        <p className="text-[9pt]">PEDIDO: #{order.id.slice(-6).toUpperCase()}</p>
        <p className="text-[8pt]">{formatDate(order.created_at)}</p>
        <p className="text-[8pt] leading-none mt-1">{SEP_LINE}</p>
      </div>

      {/* Dados do Cliente */}
      <div className="mb-2 text-[8.5pt] text-left">
        <p>CLIENTE: {order.customer_name.toUpperCase()}</p>
        <p>TIPO: {order.delivery_type === 'delivery' ? 'DELIVERY' : 'RETIRADA'}</p>
        <p>PREVISÃO: {order.order_time}</p>
        
        {!isKitchen && (
          <>
            <p>TEL: {order.customer_phone}</p>
            {order.delivery_type === 'delivery' && (
              <div className="mt-1 pt-1 border-t border-black/10">
                <p>END: {order.address_street}, {order.address_number}</p>
                <p>BAIRRO: {order.address_neighborhood}</p>
                {order.address_complement && <p>COMPL: {order.address_complement}</p>}
                {order.address_reference && <p>REF: {order.address_reference}</p>}
              </div>
            )}
          </>
        )}
        <p className="text-[8pt] leading-none mt-1">{SEP_LINE}</p>
      </div>

      {/* Itens do Pedido */}
      <div className="mb-2">
        <p className="text-center mb-1 text-[9pt] underline uppercase">
          {isKitchen ? 'ITENS PARA PREPARO' : 'RESUMO DO PEDIDO'}
        </p>
        <div className="space-y-1">
          {order.items.map((item, idx) => {
            const itemTotal = (item.price + (item.addons?.reduce((s, a) => s + a.price, 0) || 0)) * item.quantity;
            return (
              <div key={idx} className={`${isKitchen ? 'text-[11pt]' : 'text-[8.5pt]'}`}>
                <div className="item-row items-start">
                  <span className="leading-tight text-left flex-1">
                    {item.quantity}x {item.name.toUpperCase()}{item.variant ? ` (${item.variant})` : ''}
                  </span>
                  {!isKitchen && <span className="whitespace-nowrap ml-2">R${fmt(itemTotal)}</span>}
                </div>
                {item.addons?.map(a => (
                  <p key={a.name} className={`${isKitchen ? 'text-[9pt]' : 'text-[7.5pt]'} text-left pl-4 italic`}>  + {a.name}</p>
                ))}
              </div>
            );
          })}
        </div>
        <p className="text-[8pt] leading-none mt-1">{SEP_LINE}</p>
      </div>

      {/* Totais e Pagamento (Apenas Cliente) */}
      {!isKitchen && (
        <>
          <div className="space-y-1 mb-2">
            <div className="item-row text-[8.5pt]">
              <span>SUBTOTAL:</span>
              <span>R${fmt(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="item-row text-[8.5pt]">
                <span>ENTREGA:</span>
                <span>R${fmt(deliveryFee)}</span>
              </div>
            )}
            <div className="item-row text-[11pt] mt-1 pt-1 border-t border-black/30">
              <span className="underline italic uppercase">TOTAL: R${fmt(order.total_price)}</span>
            </div>
          </div>

          <div className="mb-2 text-[8.5pt] text-left">
            <p className="uppercase leading-snug border-l-4 border-black pl-2 py-1 bg-black/5">PAGAMENTO: {order.payment_method}</p>
          </div>
          <p className="text-[8pt] leading-none mt-1">{SEP_LINE}</p>
        </>
      )}

      {/* Observações */}
      {order.observation && (
        <div className={`mb-2 p-1 border-2 border-black ${isKitchen ? 'bg-black text-white' : ''}`}>
          <p className={`${isKitchen ? 'text-[9pt]' : 'text-[8pt]'} leading-tight underline mb-1 uppercase`}>OBSERVAÇÕES:</p>
          <p className={`${isKitchen ? 'text-[12pt]' : 'text-[9.5pt]'} leading-tight`}>{order.observation}</p>
        </div>
      )}

      {/* Rodapé */}
      {!isKitchen ? (
        <div className="text-center mt-2 pb-12">
          <p className="text-[9pt] uppercase">OBRIGADO PELA PREFERÊNCIA!</p>
          <p className="text-[8pt] mt-1 italic">gloriosobrownie.com.br</p>
        </div>
      ) : (
        <div className="text-center mt-2 pb-12">
          <p className="text-[11pt] uppercase border-t-2 border-black pt-1">BOM TRABALHO!</p>
        </div>
      )}
    </div>
  );
}
