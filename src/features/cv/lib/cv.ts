export const profile = {
  name: "Hồ Khắc Huy",
  brand: "huyHK",
  role: "Fullstack Engineer",
  location: "Vietnam · remote",
  email: "hkhuy2810@gmail.com",
  phone: "+84 949 671 016",
  github: "https://github.com/HuyHK-2810",
  linkedin: "https://linkedin.com/in/huyhk2810",
  facebook: "https://facebook.com/HuyHK",
  website: "https://huyhk.dev",
} as const;

export type Experience = {
  period: string;
  start: string;
  end: string;
  role: string;
  company: string;
  companyUrl?: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    period: "May 2025 — Present",
    start: "2025-05",
    end: "present",
    role: "Fullstack Engineer",
    company: "Penguin Secret Agency",
    companyUrl: "https://psa.team",
    summary:
      "Building autonomous commerce systems — ShopQuantum.AI and FangBot.AI. Frontend + backend on AI-driven product surfaces that run end-to-end without a human in the loop.",
    highlights: [
      "Ship UI for ShopQuantum.AI: storefronts, dashboards, and the human-override seams of an autonomous e-commerce engine.",
      "Backend integration with FangBot.AI's AI-employee runtime — orchestrating tools, prompts, and the long-running jobs they sit on top of.",
      "Productionize Python + TypeScript services together; keep the boundary between deterministic code and probabilistic agents explicit and debuggable.",
    ],
    stack: ["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker"],
  },
  {
    period: "Feb 2023 — May 2025",
    start: "2023-02",
    end: "2025-05",
    role: "Fullstack Engineer",
    company: "Remolution",
    summary:
      "Fullstack work on a talent acquisition platform trusted by 100+ global companies. Frontend in React/Next.js, backend in Node + Express on Postgres, deployed in Docker.",
    highlights: [
      "Built the CV→PDF export pipeline and the inverse PDF parser that pulls structured candidate data back out.",
      "Integrated Nodemailer + transactional email flows; owned the “never send the wrong email to the wrong person” invariant.",
      "Shipped OAuth/SSO for enterprise tenants — clock-skew, certificate rotation, attribute mapping, the whole quiet stack.",
      "Set up Playwright + manual testing workflows around the regression-heavy parts of the platform.",
    ],
    stack: ["React", "Next.js", "TypeScript", "Node.js", "Express", "PostgreSQL", "Docker", "Playwright"],
  },
  {
    period: "May 2021 — Feb 2023",
    start: "2021-05",
    end: "2023-02",
    role: "Frontend Developer",
    company: "Remolution",
    summary:
      "Frontend on a real-time push notification product. Ag-Grid surfaces rendering thousands of events per second across mobile + desktop without dropping frames.",
    highlights: [
      "Tuned render budgets and virtualized list strategies for live event throughput.",
      "Worked with backend on the real-time delivery contract — retries, ordering, idempotency.",
      "Carried the perf rituals (profiling, flame graphs, bundle audits) across the team.",
    ],
    stack: ["React", "JavaScript", "Ag-Grid", "Real-time"],
  },
  {
    period: "Jul 2020 — May 2021",
    start: "2020-07",
    end: "2021-05",
    role: "Frontend Developer",
    company: "Remolution",
    summary:
      "Frontend on a payment processing web app. Next.js + Gatsby, third-party gateway integration, and a lot of unhappy-path UI for failed webhooks and retried captures.",
    highlights: [
      "Mobile responsiveness + low-bandwidth load-time tuning for payment flows.",
      "Built UI states around the partial-failure modes that money infrastructure forces you to think about.",
    ],
    stack: ["Next.js", "Gatsby", "React", "API Integration"],
  },
  {
    period: "Nov 2016 — Jul 2020",
    start: "2016-11",
    end: "2020-07",
    role: "Developer / Test Leader",
    company: "FPT Software HCM",
    summary:
      "Started as a manual tester on enterprise .NET / Java builds, then crossed into development. Led test planning and task management for cross-functional teams.",
    highlights: [
      "Designed manual + automated test strategies that cut production issues by ~30%.",
      "Led project planning, estimation, and task management.",
      "Carried tester DNA into the dev side of the room — write the failing case first.",
    ],
    stack: [".NET", "Java", "React", "Manual QA", "Automation"],
  },
];

export const education = {
  school: "Can Tho University",
  degree: "Information System",
  year: "2017",
  gpa: "3.17",
};

export const certifications = [
  {
    name: "Project Management Fundamental (PMF)",
    issuer: "FPT Software",
  },
];

export const skills = {
  primary: ["React.js", "Next.js", "Node.js", "Python", "TypeScript"],
  supporting: [
    "Tailwind CSS",
    "shadcn/ui",
    "PostgreSQL",
    "Docker",
    "Express",
    "Playwright",
    "Ag-Grid",
    "Gatsby",
  ],
  practice: [
    "Test-first thinking",
    "Performance budgeting",
    "OAuth / SSO",
    "PDF generation + parsing",
    "Real-time UI",
  ],
};
