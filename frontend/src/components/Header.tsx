import Link from "next/link";

const nav = [
  { href: "/", label: "Início" },
  { href: "/rcc", label: "A RCC" },
  { href: "/meu-go", label: "Meu GO Nota 10" },
  { href: "/campanhas", label: "Campanhas" },
  { href: "/loja", label: "Loja" },
  { href: "/sou-carismatico", label: "Sou Carismático" },
  { href: "/login", label: "Login" },
  { href: "/adm", label: "Área do ADM" },
];

export function Header() {
  return (
    <header className="w-full bg-rcc-white border-b border-rcc-blue">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-rcc-green">
          RCC Maranhão
        </Link>
        <nav className="hidden md:flex gap-4">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm text-rcc-dark hover:text-rcc-green">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
