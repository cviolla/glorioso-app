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
      <div className="text-center mb-1">
        <p className="text-[14px] leading-tight">GLORIOSO BROWNIE</p>
        <p className="text-[11px] mt-1">PEDIDO: #{order.id.slice(-6).toUpperCase()}</p>
        <p className="text-[10px] opacity-80">{formatDate(order.created_at)}</p>
        <p className="mt-1">{SEP}</p>
      </div>

      {/* Dados do Cliente */}
      <div className="space-y-0.5 mb-1 text-[11px]">
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
        <p className="mt-1">{SEP}</p>
      </div>

      {/* Itens do Pedido */}
      <div className="mb-1">
        <p className="text-center mb-1 text-[12px]">RESUMO DO PEDIDO</p>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="text-[11px]">
              <div className="item-row">
                <span className="flex-1">{item.quantity}x {item.name.toUpperCase()}</span>
                <span className="whitespace-nowrap ml-2">R${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              {item.variant && <p className="text-[10px] ml-4 opacity-80">• {item.variant}</p>}
              {item.addons?.map(a => (
                <p key={a.name} className="text-[10px] ml-4 opacity-80">+ {a.name}</p>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-2">{SEP}</p>
      </div>

      {/* Totais */}
      <div className="space-y-1 mb-1">
        <div className="item-row text-[11px]">
          <span>SUBTOTAL:</span>
          <span>R${order.total_price.toFixed(2)}</span>
        </div>
        <div className="item-row text-[14px]">
          <span>TOTAL:</span>
          <span>R${order.total_price.toFixed(2)}</span>
        </div>
        <p className="mt-1">{SEP}</p>
      </div>

      {/* Pagamento e Observações */}
      <div className="mb-2 text-[11px]">
        <p>PAGAMENTO: {order.payment_method.toUpperCase()}</p>
        {order.observation && (
          <div className="mt-2 p-1 border border-black/10 rounded">
            <p className="text-[10px]">OBS: {order.observation}</p>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="text-center mt-2 pb-6">
        <p className="text-[10px] uppercase">Obrigado pela preferência!</p>
        <p className="text-[9px] mt-1">gloriosobrownie.com.br</p>
        <p className="text-[11px] mt-2">. . . . . . . . . . . .</p>
      </div>
    </div>
  );
}
