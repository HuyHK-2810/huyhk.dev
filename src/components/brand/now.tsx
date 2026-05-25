import Section, { SectionHeader } from "./section";

type NowItem = {
  verb: string;
  body: React.ReactNode;
};

// Edit this list monthly. Keep it short and specific.
const lastUpdated = "May 2026 · 1y at PSA";

const items: NowItem[] = [
  {
    verb: "Building",
    body: (
      <>
        Autonomous commerce surfaces at{" "}
        <a
          href="https://psa.team"
          target="_blank"
          rel="noreferrer"
          className="text-ink underline decoration-ember/40 underline-offset-2 hover:decoration-ember hover:text-ember"
        >
          Penguin Secret Agency
        </a>{" "}
        — ShopQuantum.AI storefronts and FangBot.AI agent runtime.
      </>
    ),
  },
  {
    verb: "Learning",
    body: "Agent orchestration patterns — tool design, retries, and the human-override seams that keep probabilistic systems honest.",
  },
  {
    verb: "Reading",
    body: "Designing Data-Intensive Applications, slowly, on weekends.",
  },
  {
    verb: "Writing",
    body: "Short notes about the tester-to-fullstack arc — see the writing list above.",
  },
  {
    verb: "Avoiding",
    body: "Shipping agent features without a deterministic fallback path.",
  },
];

export default function Now() {
  return (
    <Section id="now">
      <SectionHeader
        label="now"
        title={
          <>
            What I&apos;m actually{" "}
            <span className="italic text-ember">doing</span> this month.
          </>
        }
        lede={
          <>
            Inspired by{" "}
            <a
              href="https://nownownow.com"
              className="text-ember underline decoration-ember/30 underline-offset-2 hover:decoration-ember"
              target="_blank"
              rel="noreferrer"
            >
              nownownow.com
            </a>
            . Updated by hand, not by a feed.
          </>
        }
      />

      <div className="reveal mt-10 rounded-md border border-[var(--line-soft)] border-l-[3px] border-l-ember bg-ember-soft px-6 py-6 md:px-8">
        <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-ember-deep">
          last updated · {lastUpdated}
        </div>
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item.verb}
              className="flex items-baseline gap-3 text-[16px] leading-[1.6] text-ink"
            >
              <span aria-hidden className="text-ember">
                →
              </span>
              <span>
                <span className="font-mono text-[13px] uppercase tracking-[0.05em] text-ember-deep">
                  {item.verb}
                </span>
                <span className="ml-2">{item.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
