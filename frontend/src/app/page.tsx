import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl p-8 bg-gradient-to-r from-rcc-green to-rcc-yellow text-rcc-white">
        <h1 className="text-3xl font-bold">Unidos no Espírito Santo para transformar o Maranhão</h1>
        <p className="mt-3 max-w-2xl text-rcc-white/90">
          Portal oficial da Renovação Carismática Católica do Maranhão: notícias, campanhas, Meu GO Nota 10, loja e área administrativa.
        </p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link className="px-4 py-2 rounded-xl bg-rcc-white text-rcc-green font-semibold" href="/meu-go">
            Quero contribuir
          </Link>
          <Link className="px-4 py-2 rounded-xl border border-rcc-white text-rcc-white" href="/campanhas">
            Ver campanhas
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <Card title="Meu GO Nota 10" desc="Doação por PIX ou cartão com confirmação automática." href="/meu-go" />
        <Card title="Campanhas" desc="Rifas com vendedor obrigatório e dashboard completo." href="/campanhas" />
        <Card title="Loja" desc="Produtos oficiais com estoque e pagamento PagBank." href="/loja" />
      </section>
    </div>
  );
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-rcc-blue p-5 hover:border-rcc-green transition">
      <h3 className="font-semibold text-rcc-green">{title}</h3>
      <p className="mt-2 text-sm text-rcc-dark">{desc}</p>
      <p className="mt-4 text-sm font-semibold text-rcc-green">Acessar →</p>
    </Link>
  );
}
