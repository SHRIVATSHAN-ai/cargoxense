export function PageHeader({ eyebrow, title, description, size = 'md' }: {
  eyebrow: string; title: string; description?: string; size?: 'md' | 'lg';
}) {
  return (
    <div className={`border-b border-border ${size === 'lg' ? 'py-16' : 'py-10'}`}>
      <div className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-brand">{eyebrow}</div>
      <h1 className={`font-display mt-3 max-w-2xl font-medium leading-[1.15] text-text ${size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}>
        {title}
      </h1>
      {description && <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{description}</p>}
    </div>
  );
}
