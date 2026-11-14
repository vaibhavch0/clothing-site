export default function LegalPage({ title, updated = "14 November 2026", children }) {
  return (
    <article className="mx-auto max-w-3xl py-12 sm:py-16">
      <h1 className="display text-5xl sm:text-6xl">{title}</h1>
      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted">Last updated {updated}</p>
      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink/80 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_a]:font-semibold [&_a]:text-ink [&_a]:underline">
        {children}
      </div>
    </article>
  );
}
