import BrandMark from "./brand-mark";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--line-soft)]">
      <div className="mx-auto flex max-w-[var(--container-wide)] flex-col items-start justify-between gap-5 px-6 py-10 font-mono text-[12px] text-ink-faint md:flex-row md:items-center md:px-12">
        <div className="flex items-center gap-4">
          <BrandMark size={40} />
          <span aria-hidden>·</span>
          <span className="font-serif text-[14px] text-ink">huyhk.dev</span>
          <span aria-hidden>·</span>
          <span>{year}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>built with</span>
          <span aria-hidden className="text-ember">●</span>
          <span>huyhk</span>
        </div>
      </div>
    </footer>
  );
}
