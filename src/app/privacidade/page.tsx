"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#1c0808] text-[#f8ece3] font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1c0808]/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center">
        <Link href="/" className="mr-4 hover:bg-[#381010] p-2 rounded-full transition-colors border border-white/10">
          <ArrowLeft className="w-5 h-5 text-[#ff914a]" />
        </Link>
        <div className="flex-1 text-center pr-10">
          <h1 className="text-xl font-bold text-white">Política de Privacidade</h1>
          <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase">Documento Oficial Glorioso Brownie</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto p-6 space-y-6 text-sm md:text-base text-white/70 leading-relaxed">
        <section>
          <h2 className="text-white font-semibold mb-2">Política de Privacidade</h2>
          <p className="mb-4">A sua privacidade é importante para nós.</p>
          <p className="mb-4">
            É política do Glorioso Brownie respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Glorioso Brownie, e outros sites que possuímos e operamos.
          </p>
          <p className="mb-4">
            Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
          </p>
          <p className="mb-4">
            Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
          </p>
          <p className="mb-4">
            Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
          </p>
          <p className="mb-4">
            O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade.
          </p>
          <p className="mb-4">
            Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.
          </p>
          <p>
            O uso continuado de nosso site será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais. Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contacto connosco.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Compromisso do Usuário</h2>
          <p className="mb-4">
            O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o Glorioso Brownie oferece no site e com caráter enunciativo, mas não limitativo:
          </p>
          <ul className="space-y-4 ml-4 list-none">
            <li>
              A) Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;
            </li>
            <li>
              B) Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, jogos de sorte ou azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;
            </li>
            <li>
              C) Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do Glorioso Brownie, de seus fornecedores ou terceiros, para introduzir ou disseminar vírus informáticos ou quaisquer outros sistemas de hardware ou software que sejam capazes de causar danos anteriormente mencionados.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Mais informações</h2>
          <p className="mb-6">
            Esperemos que esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.
          </p>
          <p className="text-xs text-white/50">
            Esta política é efetiva a partir de 25 de Abril de 2026.
          </p>
        </section>
      </main>
    </div>
  );
}
