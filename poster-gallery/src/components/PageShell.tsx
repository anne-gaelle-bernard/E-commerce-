/** Simple text page frame shared by Shop, Info, Archive and Help. */
export function PageShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <main className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-[calc(44px+8vh)] min-[700px]:px-10">
      <p className="text-[13px] text-neutral-500">{eyebrow}</p>
      <h1 className="mb-12 mt-3 font-display text-[clamp(3rem,9vw,8rem)] uppercase leading-[0.88]">{title}</h1>
      {children}
    </main>
  );
}
