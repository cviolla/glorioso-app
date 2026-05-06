import React from 'react';

interface OrderSummary {
  id: string;
  created_at: string;
  customer_name: string;
  total_price: number;
  payment_method: string;
}

interface CashReportData {
  date: string;
  totals: Record<string, number>;
  total: number;
  count: number;
  items: OrderSummary[];
}

export function CashReportPrint({ data }: { data: CashReportData }) {
  const SEP = "================================";

  return (
    <div id="thermal-receipt" className="thermal-receipt font-black">
      {/* Cabeçalho */}
      <div className="text-center mb-2">
        <p className="text-[11pt] font-bold">GLORIOSO BROWNIE</p>
        <p className="text-[8.5pt] font-bold uppercase">FECHAMENTO DE CAIXA</p>
        <p className="text-[8pt]">{data.date}</p>
        <p className="text-[8pt] leading-none mt-1">{SEP}</p>
      </div>

      {/* Resumo por Pagamento */}
      <div className="mb-2">
        <p className="font-bold text-center mb-1 text-[9pt] underline uppercase">RESUMO POR PAGAMENTO</p>
        {Object.entries(data.totals).map(([method, value]) => (
          <div key={method} className="item-row text-[8.5pt]">
            <span>{method}:</span>
            <span className="font-bold">R${value.toFixed(2).replace('.', ',')}</span>
          </div>
        ))}
        <p className="text-[8pt] leading-none mt-1">{SEP}</p>
      </div>

      {/* Detalhamento dos Pedidos */}
      <div className="mb-2">
        <p className="font-bold text-center mb-1 text-[9pt] underline uppercase">PEDIDOS DO DIA</p>
        {data.items.map((order) => {
          const time = new Date(order.created_at).toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit'
          });
          return (
            <div key={order.id} className="mb-1">
              <div className="item-row text-[8pt]">
                <span>{time} {order.customer_name.toUpperCase().substring(0, 15)}</span>
                <span>R${order.total_price.toFixed(2).replace('.', ',')}</span>
              </div>
              <p className="text-[7pt] opacity-80 text-left pl-2">{order.payment_method.toUpperCase()}</p>
            </div>
          );
        })}
        <p className="text-[8pt] leading-none mt-1">{SEP}</p>
      </div>

      {/* Totais */}
      <div className="mb-2">
        <div className="item-row text-[8.5pt]">
          <span>Qtd Pedidos:</span>
          <span>{data.count}</span>
        </div>
        <div className="item-row text-[11pt] font-bold mt-1 pt-1 border-t border-black">
          <span>TOTAL BRUTO:</span>
          <span>R${data.total.toFixed(2).replace('.', ',')}</span>
        </div>
        <p className="text-[8pt] leading-none mt-1">{SEP}</p>
      </div>

      {/* Assinatura */}
      <div className="text-center mt-4 pb-2">
        <p className="text-[8pt]">________________________________</p>
        <p className="text-[8pt] mt-1 uppercase">Assinatura do Responsável</p>
      </div>
    </div>
  );
}
