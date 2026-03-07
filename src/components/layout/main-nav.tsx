import Link from 'next/link';

const links = [
  { href: '/totem', label: 'Totem do Paciente' },
  { href: '/painel-chamada', label: 'Painel de Chamada' },
  { href: '/atendente', label: 'Tela do Atendente' },
  { href: '/medico', label: 'Tela do Médico' },
  { href: '/admin', label: 'Painel Administrativo' },
];

export function MainNav() {
  return (
    <nav aria-label="Navegação principal" className="flex flex-wrap gap-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
