import Section, { SectionHeader } from "./section";

type Moment = {
  yearLabel: string;
  contextLines: string[];
  quote: string;
  paragraphs: React.ReactNode[];
  lesson: React.ReactNode;
};

const moments: Moment[] = [
  {
    yearLabel: "2016 — 2020",
    contextLines: ["FPT Software, HCM", "tester → developer"],
    quote: "“The bug I missed was the one that taught me to read code like an attacker.”",
    paragraphs: [
      <>
        My first job out of Cần Thơ wasn&apos;t building anything — it was breaking
        things on purpose. I joined FPT Software as a manual tester on enterprise
        .NET projects, and for the first two years my job was to find what the
        developers couldn&apos;t see. I wrote hundreds of test cases, ran them by
        hand, then watched the same bugs slip into production anyway because we
        caught them too late in the cycle.
      </>,
      <>
        So I started writing the test plans earlier. Then I started writing the
        automation. By the end of that stretch the team had cut production
        issues by <em className="italic text-ink">about 30%</em>, and I&apos;d
        quietly crossed over into the dev side of the room.{" "}
        <em className="italic">
          I learned that quality isn&apos;t a phase at the end of a project —
          it&apos;s a way of reading every line you write.
        </em>
      </>,
    ],
    lesson: (
      <em className="italic text-ink">
        I still open a new file the way a tester opens a feature: looking for the
        seam where it will fail.
      </em>
    ),
  },
  {
    yearLabel: "2020 — 2023",
    contextLines: ["frontend engineer", "payment & real-time products"],
    quote: "“Frontend is where the engineering finally meets a human.”",
    paragraphs: [
      <>
        The move to frontend started with a payment processing web app —
        Next.js, Gatsby, third-party APIs that had opinions about how money
        should move. The UI looked simple. The states behind it did not. A
        single failed webhook could leave a user staring at a spinner while
        their card was already charged, and there was nowhere to hide.
      </>,
      <>
        From there I joined a real-time push notification product where the UI
        had to keep up with thousands of events scrolling through Ag-Grid
        without dropping frames. I learned that{" "}
        <em className="italic text-ink">performance is a feature</em> and that
        &quot;just rerender it&quot; is the most expensive sentence in
        frontend. I started caring about render budgets the way I used to care
        about test coverage.
      </>,
    ],
    lesson: (
      <em className="italic text-ink">
        Frontend stopped being &quot;the CSS part&quot; for me the day a 200ms
        jank cost someone a transaction.
      </em>
    ),
  },
  {
    yearLabel: "2023 — 2025",
    contextLines: ["fullstack engineer", "talent platform · 100+ companies"],
    quote: "“Owning the full stack means owning the full failure mode.”",
    paragraphs: [
      <>
        For two and a half years I worked on a talent acquisition platform
        trusted by more than a hundred global companies. The frontend was React
        and Next.js with Tailwind and shadcn; the backend was Node and Express,
        deployed in Docker against Postgres. I built the CV→PDF export, the
        PDF parser that pulls structured data back out, the Nodemailer pipeline
        that had to{" "}
        <em className="italic text-ink">
          never send the wrong email to the wrong person
        </em>
        , and the OAuth/SSO flows that keep enterprise tenants quietly
        separated.
      </>,
      <>
        Backend ownership changed how I think about features. A button I
        shipped on Tuesday became a queue job I was debugging on Thursday and a
        Postgres index I was adding on Friday.
      </>,
    ],
    lesson: (
      <em className="italic text-ink">
        The full stack isn&apos;t a resume line. It&apos;s the pager that goes
        off when any layer breaks.
      </em>
    ),
  },
  {
    yearLabel: "2025 — now",
    contextLines: [
      "Penguin Secret Agency",
      "autonomous commerce · psa.team",
    ],
    quote:
      "“The hardest part of agentic systems is the part where the agent is wrong.”",
    paragraphs: [
      <>
        In May 2025 I joined{" "}
        <a
          href="https://psa.team"
          target="_blank"
          rel="noreferrer"
          className="text-ink underline decoration-ember/40 underline-offset-2 hover:decoration-ember hover:text-ember"
        >
          Penguin Secret Agency
        </a>{" "}
        as a fullstack engineer. We&apos;re building autonomous commerce
        systems — <em className="italic text-ink">ShopQuantum.AI</em>, a
        storefront that operates without a human in the loop, and{" "}
        <em className="italic text-ink">FangBot.AI</em>, a virtual business
        with 59+ AI employees running sales, marketing, support, and ops.
      </>,
      <>
        My day-to-day is React/Next on the surfaces humans touch, and Python +
        Node on the runtime the agents live in. The new muscle I&apos;m
        building: designing the seams where deterministic code hands control to
        a probabilistic agent — and the override paths a human takes back when
        the agent gets it wrong.
      </>,
    ],
    lesson: (
      <em className="italic text-ink">
        After nine years debugging code I wrote, I&apos;m learning to debug
        decisions a model made.
      </em>
    ),
  },
];

export default function Story() {
  return (
    <Section id="story">
      <SectionHeader
        label="story"
        title={
          <>
            Nine years, four{" "}
            <span className="italic text-ember">turns</span> in the road.
          </>
        }
        lede={
          <>
            I didn&apos;t start in a bootcamp. I started in a QA chair,
            watching real builds break under real load. These are the four
            moments that bent the trajectory.
          </>
        }
      />

      <ol className="mt-12 flex flex-col">
        {moments.map((m, idx) => (
          <li
            key={m.yearLabel}
            className={`reveal grid gap-6 py-10 md:grid-cols-[140px_1fr] md:gap-10 ${idx > 0 ? "border-t border-dashed border-[var(--line)]" : ""}`}
          >
            <div>
              <div className="font-mono text-[13px] text-ember-deep">
                {m.yearLabel}
              </div>
              <ul className="mt-2 space-y-1 font-mono text-[12px] text-ink-faint">
                {m.contextLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-[22px] font-medium leading-snug text-ink md:text-[26px]">
                {m.quote}
              </h3>
              <div className="mt-4 space-y-4 text-[17px] leading-[1.7] text-ink-soft">
                {m.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="mt-5 text-[16px] leading-[1.6] text-ink">
                {m.lesson}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
