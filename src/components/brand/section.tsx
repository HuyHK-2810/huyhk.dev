type SectionProps = {
  id?: string;
  align?: "left" | "center";
  /** when true, children use the full wide container (for grids that need width) */
  bleed?: boolean;
  divider?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function Section({
  id,
  align = "left",
  bleed = false,
  divider = true,
  className = "",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${divider ? "border-t border-[var(--line-soft)]" : ""} ${className}`}
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-6 py-16 md:px-12 md:py-20">
        {bleed ? (
          children
        ) : (
          <div
            className={`mx-auto max-w-[var(--container-prose)] ${align === "center" ? "text-center" : ""}`}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

type SectionHeaderProps = {
  label: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
};

export function SectionHeader({
  label,
  title,
  lede,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={`mx-auto max-w-[var(--container-prose)] ${align === "center" ? "text-center" : ""}`}
    >
      <div className="section-label mb-4">{`{ ${label} }`}</div>
      <h2 className="font-serif text-[clamp(28px,3.8vw,40px)] font-normal leading-[1.15] tracking-tight text-ink">
        {title}
      </h2>
      {lede && (
        <p
          className={`mt-5 max-w-[560px] font-serif text-[18px] font-light leading-[1.55] text-ink-soft md:text-[19px] ${align === "center" ? "mx-auto" : ""}`}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
