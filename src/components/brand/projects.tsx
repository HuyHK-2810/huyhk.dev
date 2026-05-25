import Section, { SectionHeader } from "./section";

type Project = {
  years: string;
  name: string;
  description: React.ReactNode;
  lesson: string;
  tags: string[];
};

const projects: Project[] = [
  {
    years: "2025 — now",
    name: "ShopQuantum.AI & FangBot.AI — Penguin Secret Agency",
    description: (
      <>
        Fullstack engineer at{" "}
        <a
          href="https://psa.team"
          target="_blank"
          rel="noreferrer"
          className="text-ink underline decoration-ember/40 underline-offset-2 hover:decoration-ember hover:text-ember"
        >
          Penguin Secret Agency
        </a>{" "}
        building autonomous commerce systems — a storefront that runs without a
        human in the loop, and a virtual business with 59+ AI employees. React
        + Next.js on the surfaces humans touch; Python and Node on the runtime
        the agents live in.
      </>
    ),
    lesson:
      "The seam between deterministic code and a probabilistic agent is the most important interface I've ever designed.",
    tags: ["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL"],
  },
  {
    years: "2023 — 2025",
    name: "Talent acquisition platform",
    description: (
      <>
        Fullstack work on a hiring platform trusted by 100+ global companies.
        React/Next.js + Tailwind/shadcn on the front; Node + Express, Postgres,
        and Docker on the back. I built the CV→PDF export, the PDF parser that
        pulls structured data back out, the Nodemailer integration, and
        OAuth/SSO for enterprise tenants.
      </>
    ),
    lesson:
      "Once you own the email pipeline, you stop thinking of features as screens — you start thinking of them as state machines.",
    tags: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
  },
  {
    years: "2021 — 2023",
    name: "Real-time push notification product",
    description: (
      <>
        Frontend on a live notifications product where Ag-Grid had to render
        thousands of events per second without dropping frames. I tuned render
        budgets across mobile and desktop and worked closely with backend on
        the real-time delivery contract.
      </>
    ),
    lesson:
      "Performance is the invisible feature: nobody thanks you when it's fast, but everyone leaves when it's slow.",
    tags: ["React", "JavaScript", "Ag-Grid", "Real-time"],
  },
  {
    years: "2020 — 2021",
    name: "Payment processing web app",
    description: (
      <>
        Next.js + Gatsby for a payments product that integrated third-party
        gateways. Most of the work was the unhappy paths — failed webhooks,
        retried captures, mobile responsiveness on devices we couldn&apos;t
        physically test on, and load-time tuning for low-bandwidth users.
      </>
    ),
    lesson:
      "In money flows, the loading spinner is a lie until you can prove the transaction never silently succeeded.",
    tags: ["Next.js", "Gatsby", "API Integration", "React"],
  },
  {
    years: "2016 — 2020",
    name: "Enterprise apps at FPT Software",
    description: (
      <>
        Started as a manual tester on .NET/Java enterprise builds, then crossed
        into development. Designed manual + automated test strategies that cut
        production issues by 30%, and led project planning and task management
        for cross-functional teams.
      </>
    ),
    lesson:
      "The 30% number wasn't a testing win. It was a process win — bugs caught early are bugs that never happen.",
    tags: [".NET", "React", "Manual QA", "Automation"],
  },
];

export default function Projects() {
  return (
    <Section id="projects">
      <SectionHeader
        label="projects"
        title={
          <>
            Things I&apos;ve helped{" "}
            <span className="italic text-ember">ship</span>.
          </>
        }
        lede={
          <>
            Out of respect for employer policies, I&apos;m keeping product names
            out of it. The lessons stay.
          </>
        }
      />

      <ol className="mt-12 flex flex-col">
        {projects.map((p, idx) => (
          <li
            key={p.name}
            className={`reveal group grid gap-3 py-8 transition-all duration-300 hover:pl-3 md:grid-cols-[110px_1fr_24px] md:gap-8 ${idx > 0 ? "border-t border-[var(--line-soft)]" : ""}`}
          >
            <div className="font-mono text-[12px] text-ink-faint md:pt-1">
              {p.years}
            </div>

            <div>
              <h3 className="font-serif text-[22px] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
                {p.name}
              </h3>
              <p className="mt-3 text-[16px] leading-[1.65] text-ink-soft">
                {p.description}
              </p>
              <p className="mt-3 text-[15px] italic leading-[1.6] text-ink">
                Lesson: {p.lesson}
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-[var(--line)] px-2.5 py-0.5 font-mono text-[11px] text-ink-soft"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div
              aria-hidden
              className="hidden font-mono text-[18px] text-ink-faint transition-all group-hover:translate-x-1 group-hover:text-ember md:block md:pt-2"
            >
              →
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
