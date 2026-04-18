// =============================================
// Navigation
// =============================================
export const routes = [
  { title: "Projects", href: "/projects" },
  { title: "Blog", href: "/blog" },
  { title: "Pricing", href: "/pricing" },
  { title: "Contact", href: "/contact" },
]

// =============================================
// Skills
// =============================================
export const skills = [
  {
    category: "Frontend",
    items: [
      { name: "React / Next.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Tailwind CSS", level: 92 },
      { name: "Framer Motion", level: 80 },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js / Express", level: 88 },
      { name: "PostgreSQL", level: 82 },
      { name: "REST API Design", level: 90 },
      { name: "Playwright", level: 75 },
    ],
  },
  {
    category: "Tools & DevOps",
    items: [
      { name: "Git / GitHub", level: 92 },
      { name: "Docker", level: 70 },
      { name: "CI/CD", level: 72 },
      { name: "Vercel / Netlify", level: 85 },
    ],
  },
]

// =============================================
// Experience
// =============================================
export const experience = [
  {
    company: "REMOLUTION",
    role: "Fullstack Developer",
    period: "2023 – Present",
    description:
      "Building scalable web applications with React, Next.js, and Node.js. Leading frontend architecture decisions and implementing complex UI interactions.",
    tech: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL"],
    current: true,
  },
  {
    company: "NASHPUSH",
    role: "Frontend Developer",
    period: "2022 – 2023",
    description:
      "Developed push notification management dashboard with real-time data visualization and analytics features using React.",
    tech: ["React", "TypeScript", "Tailwind CSS", "REST API"],
    current: false,
  },
  {
    company: "ALMAPAY",
    role: "Frontend Developer",
    period: "2021 – 2022",
    description:
      "Built fintech web application interfaces for digital payments platform. Focused on secure, accessible, and responsive UI components.",
    tech: ["React", "JavaScript", "CSS Modules", "Redux"],
    current: false,
  },
  {
    company: "FPT SOFTWARE",
    role: "Junior Developer",
    period: "2020 – 2021",
    description:
      "Started career developing enterprise software solutions with cross-functional teams on large-scale projects.",
    tech: ["JavaScript", "HTML/CSS", "Java", "MySQL"],
    current: false,
  },
]

// =============================================
// Projects
// =============================================
export const projects = [
  {
    title: "XNK Minh Phuc Website",
    description:
      "Full-stack company website for an import/export business featuring product catalog, pricing tables, and CMS integration.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    href: "/pricing/xnkminhphuc",
    featured: true,
    status: "Live",
  },
  {
    title: "HuyHK.dev Portfolio",
    description:
      "Personal portfolio with glassmorphism design, blog, skills visualization, and real contact form. Built with Next.js 15 + React 19.",
    tech: ["Next.js 15", "React 19", "Tailwind CSS 4", "Framer Motion"],
    href: "/",
    featured: true,
    status: "Live",
  },
  {
    title: "Notification Dashboard",
    description:
      "Real-time push notification management dashboard with analytics, audience segmentation, and campaign tracking.",
    tech: ["React", "TypeScript", "Chart.js", "WebSocket"],
    href: "#",
    featured: false,
    status: "Internal",
  },
  {
    title: "Payment Gateway UI",
    description:
      "Secure, accessible payment flow interface for a fintech platform with multi-language support and dark mode.",
    tech: ["React", "Redux", "CSS Modules", "i18n"],
    href: "#",
    featured: false,
    status: "Internal",
  },
]

// =============================================
// Blog Posts
// =============================================
export const blogPosts = [
  {
    slug: "nextjs-15-whats-new",
    title: "Next.js 15: What's New and Why It Matters",
    description:
      "A deep dive into Next.js 15's new features including React 19 support, improved caching, and the new after() API.",
    date: "2025-03-10",
    readTime: "8 min",
    category: "Next.js",
    tags: ["nextjs", "react", "web-development"],
    pinned: true,
  },
  {
    slug: "glassmorphism-tailwind",
    title: "Building Glassmorphism UI with Tailwind CSS 4",
    description:
      "Create stunning glassmorphism effects using Tailwind CSS 4's new features including backdrop-blur and CSS variables.",
    date: "2025-02-20",
    readTime: "6 min",
    category: "CSS",
    tags: ["tailwind", "css", "design"],
    pinned: true,
  },
  {
    slug: "typescript-strict-mode",
    title: "Why TypeScript Strict Mode Will Save Your Project",
    description:
      "An honest look at why enabling strict mode in TypeScript is worth the initial pain and how it prevents real production bugs.",
    date: "2025-01-15",
    readTime: "5 min",
    category: "TypeScript",
    tags: ["typescript", "best-practices"],
    pinned: false,
  },
  {
    slug: "react-19-server-actions",
    title: "React 19 Server Actions: A Practical Guide",
    description:
      "Everything you need to know about React 19's server actions, from basic forms to complex mutations with optimistic updates.",
    date: "2024-12-01",
    readTime: "10 min",
    category: "React",
    tags: ["react", "nextjs", "server-actions"],
    pinned: false,
  },
  {
    slug: "postgresql-performance",
    title: "PostgreSQL Performance Tips Every Developer Should Know",
    description:
      "Practical indexing strategies, query optimization, and EXPLAIN ANALYZE tips to make your PostgreSQL queries fast.",
    date: "2024-11-10",
    readTime: "7 min",
    category: "Database",
    tags: ["postgresql", "backend", "performance"],
    pinned: false,
  },
]

// =============================================
// Social Links
// =============================================
export const socials = [
  { name: "GitHub", href: "https://github.com/huyhk-2810" },
  { name: "LinkedIn", href: "https://linkedin.com/in/huyhk" },
  { name: "Twitter / X", href: "https://twitter.com/huyhk" },
]

// =============================================
// Contact Info
// =============================================
export const contactInfo = {
  email: "contact@huyhk.dev",
  location: "Ho Chi Minh City, Vietnam",
  availability: "Open to opportunities",
}
