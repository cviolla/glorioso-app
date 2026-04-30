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

const SEP = '--------------------------------';

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
      <div className="text-center">
        <p className="text-sm font-bold">GLORIOSO BROWNIE</p>
        <p className="text-[8px]">{SEP}</p>
        <p className="text-[9px] font-bold">PEDIDO: #{order.id.slice(-6).toUpperCase()}</p>
        <p className="text-[8px]">{formatDate(order.created_at)}</p>
        <p className="text-[8px]">{SEP}</p>
      </div>

      {/* Dados do Cliente */}
      <div className="mb-1">
        <p><strong>CLIENTE:</strong> {order.customer_name}</p>
        <p><strong>TEL:</strong> {order.customer_phone}</p>
        <p className="text-[8px]">{SEP}</p>
        <p><strong>TIPO:</strong> {order.delivery_type === 'delivery' ? 'DELIVERY' : 'RETIRADA'}</p>
        <p><strong>PREVISÃO:</strong> {order.order_time}</p>
        {order.delivery_type === 'delivery' && (
          <>
            <p><strong>END:</strong> {order.address_street}, {order.address_number}</p>
            <p><strong>BAIRRO:</strong> {order.address_neighborhood}</p>
            {order.address_complement && <p><strong>COMPL:</strong> {order.address_complement}</p>}
            {order.address_reference && <p><strong>REF:</strong> {order.address_reference}</p>}
          </>
        )}
        <p className="text-[8px]">{SEP}</p>
      </div>

      {/* Itens do Pedido */}
      <div className="mb-1">
        <p className="font-bold text-center mb-1">RESUMO DO PEDIDO</p>
        {order.items.map((item, idx) => (
          <div key={idx} className="mb-1">
            <div className="item-row">
              <span className="font-bold">{item.quantity}x {item.name.substring(0, 18)}</span>
              <span className="font-bold">R${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            {item.variant && <p className="text-[8px] ml-1 opacity-70">• {item.variant}</p>}
            {item.addons?.map(a => (
              <p key={a.name} className="text-[8px] ml-1 opacity-70">+ {a.name}</p>
            ))}
          </div>
        ))}
        <p className="text-[8px]">{SEP}</p>
      </div>

      {/* Totais */}
      <div className="mb-1">
        <div className="item-row">
          <span>Subtotal:</span>
          <span>R${order.total_price.toFixed(2)}</span>
        </div>
        <div className="item-row font-bold">
          <span>TOTAL:</span>
          <span>R${order.total_price.toFixed(2)}</span>
        </div>
        <p className="text-[8px] mt-1">{SEP}</p>
      </div>

      {/* Pagamento e Observações */}
      <div className="mb-2">
        <p><strong>PAGAMENTO:</strong> {order.payment_method}</p>
        {order.observation && (
          <div className="mt-1">
            <p className="text-[8px]"><strong>OBS:</strong> {order.observation}</p>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="text-center mt-2 pb-4">
        <p className="text-[8px] uppercase tracking-widest">Obrigado pela preferência!</p>
        <p className="text-[7px] mt-1">gloriosobrownie.com.br</p>
        <p className="text-[8px] mt-2">. . . . . . . . . . . . . . . .</p>
      </div>
    </div>
  );
}
