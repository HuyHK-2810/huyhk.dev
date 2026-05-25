# huyhk.dev — Refactor Brief (v2)

> **Goal**: Transform the current portfolio (generic developer template) into a distinctive personal brand site inspired by [sunnynhanra.com](https://sunnynhanra.com) — editorial, story-driven, with strong personal voice.

---

## 0. Personal Context (source of truth)

This is the factual context Claude Code should use when generating content. **All story/copy must be grounded in these facts.** Do not invent project names, employers, or numbers beyond what's listed here.

### About Huy
- **Full name**: Hồ Khắc Huy
- **Location**: Cần Thơ, Vietnam
- **Email**: hkhuy2810@gmail.com
- **Phone**: 0949671016
- **LinkedIn**: in/huyhk2810
- **GitHub**: HuyHK-2810
- **Brand**: huyHK / huyhk.dev
- **Years of experience**: 9 years professional (started Nov 2016)
- **Education**: Information System, Can Tho University, 2017, GPA 3.17
- **Certification**: Project Management Fundamental Certificate (PMF) — FPT Software

### Tech stack priority (order matters for site emphasis)
1. **React.js / Next.js** — primary frontend
2. **Node.js** — primary backend
3. **Python** — secondary backend
4. **TypeScript** — language of choice
5. Supporting: Tailwind CSS, shadcn/ui, PostgreSQL, Docker, Playwright

### Experience timeline (factual)

| Period | Role | Company | Focus |
| --- | --- | --- | --- |
| Feb 2023 – Present | Fullstack Engineer | Remolution | Frontend + backend, talent platform |
| May 2021 – Feb 2023 | Frontend Developer | Remolution | Real-time UI, Ag-Grid, push notifications |
| Jul 2020 – May 2021 | Frontend Developer | Remolution | Next.js + Gatsby, payment app |
| Nov 2016 – Jul 2020 | Developer / Test Leader | FPT Software HCM | Manual + automated testing, dev |

**IMPORTANT**: Refer to Remolution products generically — no Leapin / NashPush / Almapay product names. Use "talent acquisition platform", "real-time push notification product", "payment processing web app".

### Career arc (the narrative spine)
**Tester → Frontend → Fullstack.** This is the unique angle. The site should lean into the tester DNA shaping how Huy writes code now.

---

## 2. Brand System

- Signature mark: `{ huyHK }` (curly braces wrap the name and section labels: `{ story }`, `{ projects }`, `{ now }`)
- Ember accent `#FF6B35`, warm paper background `#FAF8F5`
- Typography pairing: Fraunces (serif, display + italic for emotion), Inter (sans, body), JetBrains Mono (metadata, labels)
- Lowercase nav, mono uppercase section labels with letter-spacing 0.08em

See `src/app/globals.css` for the token implementation.

---

## 11. Migration Checklist

- [x] Set up branch `feat/personal-brand-redesign`
- [x] Install fonts via next/font (Fraunces, Inter, JetBrains Mono)
- [x] Add design tokens via Tailwind v4 `@theme`
- [x] Build `<Nav />` with sticky + backdrop blur
- [x] Build `<Hero />` with pulsing dot + dot-grid accent
- [x] Generate `<Story />` content from facts (no product names)
- [x] Generate `<PullQuote />` candidates (3-5 options, pick one)
- [x] Build `<HowIWork />` 4-principle grid
- [x] Generate `<Projects />` content using generic Remolution naming
- [x] MDX setup for `<Writing />` with seed posts
- [x] Build `<Now />` template with editable monthly content
- [x] `<Contact />` with real socials + `<Footer />`
- [x] Scroll reveal observer (progressive enhancement)
- [x] `Q` keyboard shortcut to scroll to contact
- [x] OG image with brand mark via Next ImageResponse
- [x] Meta tags + metadataBase
- [ ] Test on mobile
- [ ] Deploy to preview

---

## 12. Reference

- Inspiration: https://sunnynhanra.com
- Now-page concept: https://nownownow.com
- Brand components live in `src/components/brand/`
- Writing posts live in `src/content/posts/`

**Final rule**: anything that doesn't serve "feel like Huy wrote it, not a template" should be cut.
