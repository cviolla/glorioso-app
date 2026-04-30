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

const SEP = '--------------------------------';

export function CashReportPrint({ data }: { data: CashReportData }) {
  return (
    <div id="thermal-receipt" className="thermal-receipt">
      {/* Cabeçalho */}
      <div className="text-center">
        <p className="text-sm font-bold">GLORIOSO BROWNIE</p>
        <p className="text-[8px]">{SEP}</p>
        <p className="text-[9px] font-bold">FECHAMENTO DE CAIXA</p>
        <p className="text-[8px]">{data.date}</p>
        <p className="text-[8px]">{SEP}</p>
      </div>

      {/* Resumo por Pagamento */}
      <div className="mb-1">
        <p className="font-bold text-center mb-1">RESUMO POR PAGAMENTO</p>
        {Object.entries(data.totals).map(([method, value]) => (
          <div key={method} className="item-row">
            <span>{method}:</span>
            <span className="font-bold">R${value.toFixed(2)}</span>
          </div>
        ))}
        <p className="text-[8px] mt-1">{SEP}</p>
      </div>

      {/* Detalhamento dos Pedidos */}
      <div className="mb-1">
        <p className="font-bold text-center mb-1">PEDIDOS DO DIA</p>
        {data.items.map((order) => {
          const time = new Date(order.created_at).toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit'
          });
          return (
            <div key={order.id} className="mb-0.5">
              <div className="item-row">
                <span>{time} {order.customer_name.substring(0, 14)}</span>
                <span>R${order.total_price.toFixed(2)}</span>
              </div>
              <p className="text-[7px] opacity-70 ml-1">{order.payment_method}</p>
            </div>
          );
        })}
        <p className="text-[8px] mt-1">{SEP}</p>
      </div>

      {/* Totais */}
      <div className="mb-1">
        <div className="item-row">
          <span>Qtd Pedidos:</span>
          <span>{data.count}</span>
        </div>
        <div className="item-row font-bold">
          <span>TOTAL BRUTO:</span>
          <span>R${data.total.toFixed(2)}</span>
        </div>
        <p className="text-[8px] mt-1">{SEP}</p>
      </div>

      {/* Assinatura */}
      <div className="text-center mt-4 pb-4">
        <p className="text-[8px]">________________________________</p>
        <p className="text-[7px] mt-1">Assinatura do Responsável</p>
        <p className="text-[8px] mt-4">. . . . . . . . . . . . . . . .</p>
      </div>
    </div>
  );
}
