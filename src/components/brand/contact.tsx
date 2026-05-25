import Section, { SectionHeader } from "./section";

type Social = {
  label: string;
  href: string;
};

const socials: Social[] = [
  { label: "github", href: "https://github.com/HuyHK-2810" },
  { label: "linkedin", href: "https://linkedin.com/in/huyhk2810" },
  { label: "facebook", href: "https://facebook.com/HuyHK" },
  { label: "email", href: "mailto:hkhuy2810@gmail.com" },
];

export default function Contact() {
  return (
    <Section id="contact">
      <SectionHeader
        label="say hi"
        align="center"
        title={
          <>
            Want to build something{" "}
            <span className="italic text-ember">together?</span>
          </>
        }
        lede={
          <>
            I&apos;m always up for a conversation about products, code, or the
            quieter parts of shipping. Pick whichever channel feels right.
          </>
        }
      />

      <ul className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {socials.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noreferrer" : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 font-mono text-[13px] text-ink-soft transition-all hover:-translate-y-px hover:border-ember hover:text-ember"
            >
              {s.label}
              <span aria-hidden>↗</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
