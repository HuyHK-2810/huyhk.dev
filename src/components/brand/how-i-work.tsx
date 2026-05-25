import Section, { SectionHeader } from "./section";

type Principle = {
  title: string;
  body: React.ReactNode;
};

const principles: Principle[] = [
  {
    title: "Test-first thinking",
    body: (
      <>
        Four years in QA taught me to write the failing case before the feature.
        Even when I&apos;m not writing the test file, I&apos;m sketching the
        edge cases in my head — zero, scale, the network blinks.
      </>
    ),
  },
  {
    title: "Ship, then learn",
    body: (
      <>
        A boring version in production tells me more than a perfect version on
        my laptop. I&apos;d rather ship the small honest thing, watch real
        users touch it, and iterate from real signal than tune in isolation.
      </>
    ),
  },
  {
    title: "Boring code wins",
    body: (
      <>
        Future-me at 11pm fixing a Sev-2 doesn&apos;t want clever. I lean on
        readable names, plain control flow, and small functions you can finish
        in one breath. Cleverness is a tax the on-call rotation pays.
      </>
    ),
  },
  {
    title: "Own the rollback",
    body: (
      <>
        If I shipped it, I&apos;m the one who reverts it. Feature flags,
        migration plans, and a clear undo path aren&apos;t process — they&apos;re
        respect for the people running on top of my code.
      </>
    ),
  },
];

export default function HowIWork() {
  return (
    <Section id="how-i-work" bleed>
      <SectionHeader
        label="how i work"
        title={
          <>
            Four rules I keep coming{" "}
            <span className="italic text-ember">back to</span>.
          </>
        }
        lede={
          <>
            None of these are clever. They&apos;re what&apos;s left after nine
            years of shipping, breaking, and rolling back.
          </>
        }
      />

      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-md bg-[var(--line-soft)] sm:grid-cols-2 lg:grid-cols-4">
        {principles.map((p, idx) => (
          <article
            key={p.title}
            className="reveal flex flex-col gap-3 bg-paper-pure p-6 transition-colors duration-300 hover:bg-ember-soft md:p-7"
          >
            <div className="font-mono text-[12px] text-ember-deep">
              {String(idx + 1).padStart(2, "0")} /{" "}
              {String(principles.length).padStart(2, "0")}
            </div>
            <h3 className="font-serif text-[20px] font-medium leading-snug text-ink">
              {p.title}
            </h3>
            <p className="text-[15px] leading-[1.65] text-ink-soft">{p.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
