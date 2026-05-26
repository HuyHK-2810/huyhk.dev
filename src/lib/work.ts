export type CaseStudy = {
  slug: string;
  years: string;
  /** Short label used on cards (no employer / product names for older work). */
  name: string;
  /** Eyebrow / category text. */
  kind: string;
  /** Role line. */
  role: string;
  /** Optional employer mention (only where allowed). */
  employer?: string;
  /** External URL if the product is public. */
  url?: string;
  /** 1-sentence headline used at top of the detail page. */
  tagline: string;
  /** 2-3 paragraph lede shown under the headline. */
  summary: string[];
  /** Numeric / qualitative outcome bullets, shown as KPI tiles. */
  outcomes: { label: string; value: string }[];
  /** Specific things I did. Action verbs, end with a period. */
  contributions: string[];
  /** Bullet list of lessons learned. Each lesson 1 sentence. */
  lessons: string[];
  /** Tech stack pills. */
  tags: string[];
  /** Optional follow-up reading links to related blog posts. */
  related?: { slug: string; title: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "psa",
    years: "2025 — now",
    name: "ShopQuantum.AI & FangBot.AI",
    kind: "autonomous commerce",
    role: "Fullstack Engineer",
    employer: "Penguin Secret Agency",
    url: "https://psa.team",
    tagline:
      "Two products in the same agent runtime: a storefront that operates without a human in the loop, and a virtual business with 59+ AI employees.",
    summary: [
      "Penguin Secret Agency is building the surfaces and the runtime for autonomous commerce. I joined in May 2025 as a fullstack engineer to work on both products that sit on top of that runtime.",
      "ShopQuantum.AI is the storefront layer — the customer-facing experience that lets an autonomous shop run pricing, listings, and order ops without a person clicking through admin. FangBot.AI is the agent business layer — 59+ specialised AI employees running sales, marketing, support, and ops on a virtual roster.",
      "My day-to-day is React/Next.js on the surfaces humans touch, and Python + Node on the runtime the agents live in. The new muscle I'm building: designing the seams where deterministic code hands control to a probabilistic agent — and the override paths a human takes back when the agent gets it wrong.",
    ],
    outcomes: [
      { label: "AI employees", value: "59+" },
      { label: "products", value: "2" },
      { label: "humans in the loop", value: "0" },
    ],
    contributions: [
      "Built customer-facing storefront flows in Next.js App Router and Server Components.",
      "Designed agent ↔ deterministic-code seams with explicit override paths.",
      "Owned several Python services in the agent runtime alongside Node API layers.",
      "Wired typed contracts between the agent tool calls and the order/inventory side-effects.",
    ],
    lessons: [
      "The seam between deterministic code and a probabilistic agent is the most important interface I've designed.",
      "The hardest part of agentic systems is the part where the agent is wrong — design the override before the happy path.",
      "Logging tool calls beats logging prompts: the prompt explains intent, the tool call explains effect.",
    ],
    tags: ["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL", "Agents"],
    related: [{ slug: "next-and-python", title: "Next.js + Python: my current backend pairing" }],
  },
  {
    slug: "talent-platform",
    years: "2023 — 2025",
    name: "Talent acquisition platform",
    kind: "enterprise SaaS",
    role: "Fullstack Engineer",
    tagline:
      "Two and a half years building the hiring platform trusted by more than a hundred global companies.",
    summary: [
      "I joined the fullstack team on a talent acquisition platform serving 100+ global companies. The frontend was React/Next.js with Tailwind and shadcn; the backend was Node and Express deployed in Docker against Postgres. The product touched recruiters, hiring managers, and candidates — each with different trust levels and different unhappy paths.",
      "My work spanned the full request lifecycle: CV-to-PDF export, a PDF parser that pulled structured data back out, the Nodemailer pipeline that had to never send the wrong email to the wrong person, and the OAuth/SSO flows that quietly separate enterprise tenants.",
      "Owning the backend changed how I think about features. A button I shipped on Tuesday became a queue job I was debugging on Thursday and a Postgres index I was adding on Friday.",
    ],
    outcomes: [
      { label: "global tenants", value: "100+" },
      { label: "uptime owned", value: "24/7" },
      { label: "languages handled", value: "6" },
    ],
    contributions: [
      "Built CV→PDF export and the inverse PDF parser that lifted structured data back out.",
      "Owned the Nodemailer pipeline including bounce handling and tenant-scoped templates.",
      "Shipped OAuth/SSO for multi-tenant enterprise customers with cert rotation handling.",
      "Tuned the Postgres index and query plan for the recruiter search hot path.",
    ],
    lessons: [
      "Once you own the email pipeline, you stop thinking of features as screens — they become state machines.",
      "Enterprise SSO is a customer-success job that happens to involve protocols.",
      "PDFs are the most underestimated integration surface in B2B SaaS.",
    ],
    tags: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Docker", "OAuth"],
    related: [
      { slug: "oauth-sso-warning", title: "OAuth/SSO integration: the part nobody warned me about" },
    ],
  },
  {
    slug: "realtime-push",
    years: "2021 — 2023",
    name: "Real-time push notification product",
    kind: "real-time UI",
    role: "Frontend Engineer",
    tagline:
      "A live notifications product where Ag-Grid had to render thousands of events per second without dropping frames.",
    summary: [
      "I came onto this product to keep the UI fast under load. The use case was a live feed of notification events — thousands per second on a busy tenant — rendered in a sortable, filterable grid that operators were watching in real time.",
      "I worked alongside backend on the delivery contract, optimised the Ag-Grid render budget, and gradually unwound the patterns that had grown into 200ms scroll jank. I learned that performance is a feature and that 'just rerender it' is the most expensive sentence in frontend.",
    ],
    outcomes: [
      { label: "events/sec rendered", value: "1000s" },
      { label: "scroll jank fixed", value: "200ms → 0" },
      { label: "dropped frames", value: "—" },
    ],
    contributions: [
      "Profiled and unwound rerender storms in a busy Ag-Grid integration.",
      "Co-designed the real-time delivery contract with the backend team.",
      "Built virtualization budgets that survived mobile + desktop in parallel.",
    ],
    lessons: [
      "Performance is the invisible feature: nobody thanks you when it's fast, but everyone leaves when it's slow.",
      "Memoization without measurement is just superstition.",
    ],
    tags: ["React", "JavaScript", "Ag-Grid", "Real-time", "Performance"],
    related: [
      { slug: "ag-grid-to-shadcn", title: "From Ag-Grid to shadcn: 9 years of frontend evolution" },
    ],
  },
  {
    slug: "payment-app",
    years: "2020 — 2021",
    name: "Payment processing web app",
    kind: "fintech frontend",
    role: "Frontend Engineer",
    tagline:
      "Next.js + Gatsby for a payments product that integrated third-party gateways. Most of the work was the unhappy paths.",
    summary: [
      "Failed webhooks, retried captures, mobile responsiveness on devices we couldn't physically test on, and load-time tuning for low-bandwidth users — those were the actual job. The happy path was 40 lines. The rest was everything that decides whether someone trusts you with their card next time.",
      "I learned that in money flows, the loading spinner is a lie until you can prove the transaction never silently succeeded.",
    ],
    outcomes: [
      { label: "gateways integrated", value: "3" },
      { label: "unhappy paths", value: "shipped first" },
      { label: "spinner lifetime", value: "bounded" },
    ],
    contributions: [
      "Shipped a Next.js + Gatsby frontend on top of third-party gateways.",
      "Built deterministic state machines for retry/cancel/refund flows.",
      "Tuned low-bandwidth performance for non-flagship-device users.",
    ],
    lessons: [
      "In money flows, the loading spinner is a lie until you can prove the transaction never silently succeeded.",
      "Mobile responsiveness on a payment screen is a regulatory feature, not a polish step.",
    ],
    tags: ["Next.js", "Gatsby", "API Integration", "React", "Payments"],
  },
  {
    slug: "fpt",
    years: "2016 — 2020",
    name: "Enterprise apps at FPT Software",
    kind: "QA → development",
    role: "Developer / Test Leader",
    employer: "FPT Software HCM",
    tagline:
      "Started as a manual tester on .NET/Java enterprise builds, then crossed into development. The career corner that defined the rest of it.",
    summary: [
      "My first job after Can Tho University was four years of finding what developers couldn't see. For two years I wrote test cases by hand and watched bugs slip into production anyway. Then I started writing them earlier, automating them, and quietly moving over to the dev side of the room.",
      "By the end of that stretch I'd led test strategy for several enterprise builds, helped reduce production issues by roughly 30%, and earned the PMF certification along the way. The number isn't what mattered. What mattered was learning that quality isn't a phase at the end of a project — it's a way of reading every line you write.",
    ],
    outcomes: [
      { label: "production issues cut", value: "~30%" },
      { label: "years in QA", value: "4" },
      { label: "tester → dev", value: "✓" },
    ],
    contributions: [
      "Designed manual + automated test strategies that cut production issues by ~30%.",
      "Led project planning and task management across cross-functional teams.",
      "Migrated from manual-only into a development role while keeping the test instinct.",
      "Earned the FPT Software Project Management Fundamentals certificate.",
    ],
    lessons: [
      "The 30% wasn't a testing win — it was a process win. Bugs caught early are bugs that never happen.",
      "Quality isn't a phase at the end of a project; it's a way of reading every line you write.",
    ],
    tags: [".NET", "Java", "React", "Manual QA", "Automation"],
    related: [
      { slug: "tester-dna", title: "Why I still think like a tester after 4 years as a fullstack dev" },
      { slug: "thirty-percent-rule", title: "The 30% rule — what reducing production bugs at FPT taught me" },
    ],
  },
];

export function getAllCaseStudies(): CaseStudy[] {
  return caseStudies;
}

export function getCaseStudy(slug: string): CaseStudy | null {
  return caseStudies.find((c) => c.slug === slug) ?? null;
}
