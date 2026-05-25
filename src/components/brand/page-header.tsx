type PageHeaderProps = {
  label?: string;
  title: string;
  description?: string;
};

export default function PageHeader({ label, title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-[var(--line-soft)]">
      <div className="mx-auto max-w-[var(--container-wide)] px-6 pb-14 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="max-w-[var(--container-prose)]">
          {label && <div className="section-label mb-4">{`{ ${label} }`}</div>}
          <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal leading-[1.1] tracking-tight text-ink">
            {title}
          </h1>
          {description && (
            <p className="mt-5 font-serif text-[19px] font-light leading-[1.55] text-ink-soft">
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
