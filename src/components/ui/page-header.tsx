interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="max-w-3xl text-slate-600">{description}</p>
    </header>
  );
}
