export function Footer() {
  return (
    <footer className="w-full mt-12 border-t border-rcc-blue bg-rcc-white">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-rcc-dark">
        © {new Date().getFullYear()} RCC Maranhão — Plataforma Oficial.
      </div>
    </footer>
  );
}
