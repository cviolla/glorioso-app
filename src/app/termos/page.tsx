"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#1c0808] text-[#f8ece3] font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1c0808]/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center">
        <Link href="/" className="mr-4 hover:bg-[#381010] p-2 rounded-full transition-colors border border-white/10">
          <ArrowLeft className="w-5 h-5 text-[#ff914a]" />
        </Link>
        <div className="flex-1 text-center pr-10">
          <h1 className="text-xl font-bold text-white">Termos de Uso</h1>
          <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase">Documento Oficial Glorioso Brownie</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto p-6 space-y-6 text-sm md:text-base text-white/70 leading-relaxed">
        <section>
          <h2 className="text-white font-semibold mb-2">1. Termos</h2>
          <p>
            Ao acessar ao site Glorioso Brownie, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">2. Uso de Licença</h2>
          <p className="mb-2">
            É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Glorioso Brownie, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode: modificar ou copiar os materiais; usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial); tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Glorioso Brownie; remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou transferir os materiais para outra pessoa ou &apos;espelhe&apos; os materiais em qualquer outro servidor.
          </p>
          <p>
            Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida por Glorioso Brownie a qualquer momento. Ao encerrar a visualização desses materiais ou após o término desta licença, você deve apagar todos os materiais baixados em sua posse, seja em formato eletrónico ou impresso.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">3. Isenção de responsabilidade</h2>
          <p>
            Os materiais no site da Glorioso Brownie são fornecidos &apos;como estão&apos;. Glorioso Brownie não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos. Além disso, o Glorioso Brownie não garante ou faz qualquer representação relativa à precisão, aos resultados prováveis ou à confiabilidade do uso dos materiais em seu site ou de outra forma relacionado a esses materiais ou em sites vinculados a este site.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">4. Limitações</h2>
          <p>
            Em nenhum caso o Glorioso Brownie ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Glorioso Brownie, mesmo que Glorioso Brownie ou um representante autorizado da Glorioso Brownie tenha sido notificado oralmente ou por escrito da possibilidade de tais danos. Como algumas jurisdições não permitem limitações em garantias implícitas, ou limitações de responsabilidade por danos conseqüentes ou incidentais, essas limitações podem não se aplicar a você.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">5. Precisão dos materiais</h2>
          <p>
            Os materiais exibidos no site da Glorioso Brownie podem incluir erros técnicos, tipográficos ou fotográficos. Glorioso Brownie não garante que qualquer material em seu site seja preciso, completo ou atual. Glorioso Brownie pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio. No entanto, Glorioso Brownie não se compromete a atualizar os materiais.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">6. Links</h2>
          <p>
            O Glorioso Brownie não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por Glorioso Brownie do site. O uso de qualquer site vinculado é por conta e risco do usuário.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Modificações</h2>
          <p>
            O Glorioso Brownie pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Lei aplicável</h2>
          <p>
            Estes termos e condições são regidos e interpretados de acordo com as leis do Glorioso Brownie e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
          </p>
        </section>
      </main>
    </div>
  );
}
