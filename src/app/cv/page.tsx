import Link from "next/link";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import PrintButton from "./print-button";
import {
  profile,
  experience,
  education,
  certifications,
  skills,
} from "@/features/cv/lib/cv";

export const metadata = {
  title: "CV — huyHK",
  description: `Resume of ${profile.name} — ${profile.role} in ${profile.location}.`,
};

export default function CVPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px] print:pt-8">
        <div className="max-w-[var(--container-prose)]">
          <Link
            href="/"
            className="font-mono text-[13px] text-ink-faint hover:text-ember print:hidden"
          >
            ← back home
          </Link>

          {/* Header */}
          <header className="mt-8 border-b border-[var(--line)] pb-8">
            <div className="section-label mb-4 print:hidden">{"{ cv }"}</div>
            <h1 className="font-serif text-[clamp(34px,5vw,48px)] font-normal leading-[1.1] tracking-tight text-ink">
              {profile.name}
            </h1>
            <p className="mt-3 font-serif text-[19px] font-light text-ink-soft">
              {profile.role} · {profile.location}
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] text-ink-soft">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-ember"
                >
                  {profile.email}
                </a>
              </li>
              <li>{profile.phone}</li>
              <li>
                <a
                  href={profile.website}
                  className="hover:text-ember"
                  target="_blank"
                  rel="noreferrer"
                >
                  huyhk.dev
                </a>
              </li>
              <li>
                <a
                  href={profile.github}
                  className="hover:text-ember"
                  target="_blank"
                  rel="noreferrer"
                >
                  github/HuyHK-2810
                </a>
              </li>
              <li>
                <a
                  href={profile.linkedin}
                  className="hover:text-ember"
                  target="_blank"
                  rel="noreferrer"
                >
                  linkedin/in/huyhk2810
                </a>
              </li>
            </ul>
            <div className="mt-6 print:hidden">
              <PrintButton />
            </div>
          </header>

          {/* Summary */}
          <Block label="summary">
            <p className="text-[16px] leading-[1.7] text-ink-soft">
              Fullstack engineer with 9+ years of experience. Tester DNA from a
              4-year QA foundation, frontend depth from years of real-time and
              payments work, and present-day backend ownership across Node and
              Python. Currently building autonomous commerce systems at{" "}
              <a
                href="https://psa.team"
                target="_blank"
                rel="noreferrer"
                className="text-ink underline decoration-ember/40 underline-offset-2 hover:decoration-ember hover:text-ember"
              >
                Penguin Secret Agency
              </a>
              .
            </p>
          </Block>

          {/* Experience */}
          <Block label="experience">
            <ol className="flex flex-col">
              {experience.map((exp, idx) => (
                <li
                  key={`${exp.company}-${exp.start}`}
                  className={`py-6 ${idx > 0 ? "border-t border-dashed border-[var(--line)]" : ""}`}
                >
                  <div className="grid gap-3 md:grid-cols-[140px_1fr] md:gap-8">
                    <div className="font-mono text-[12px] text-ember-deep md:pt-1">
                      {exp.period}
                    </div>
                    <div>
                      <h3 className="font-serif text-[20px] font-medium leading-snug text-ink">
                        {exp.role} ·{" "}
                        {exp.companyUrl ? (
                          <a
                            href={exp.companyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-ember/40 underline-offset-2 hover:decoration-ember hover:text-ember"
                          >
                            {exp.company}
                          </a>
                        ) : (
                          exp.company
                        )}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.65] text-ink-soft">
                        {exp.summary}
                      </p>
                      <ul className="mt-3 space-y-1.5 text-[14px] leading-[1.55] text-ink-soft">
                        {exp.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-ember">→</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {exp.stack.map((t) => (
                          <li
                            key={t}
                            className="rounded-full border border-[var(--line)] px-2.5 py-0.5 font-mono text-[11px] text-ink-soft"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Block>

          {/* Skills */}
          <Block label="skills">
            <dl className="grid gap-5 md:grid-cols-[140px_1fr] md:gap-8">
              <dt className="font-mono text-[12px] text-ember-deep md:pt-1">
                Primary
              </dt>
              <dd className="font-mono text-[14px] text-ink">
                {skills.primary.join(" · ")}
              </dd>
              <dt className="font-mono text-[12px] text-ember-deep md:pt-1">
                Supporting
              </dt>
              <dd className="font-mono text-[14px] text-ink-soft">
                {skills.supporting.join(" · ")}
              </dd>
              <dt className="font-mono text-[12px] text-ember-deep md:pt-1">
                Practice
              </dt>
              <dd className="font-mono text-[14px] text-ink-soft">
                {skills.practice.join(" · ")}
              </dd>
            </dl>
          </Block>

          {/* Education */}
          <Block label="education">
            <div className="grid gap-3 md:grid-cols-[140px_1fr] md:gap-8">
              <div className="font-mono text-[12px] text-ember-deep md:pt-1">
                {education.year}
              </div>
              <div>
                <h3 className="font-serif text-[18px] font-medium text-ink">
                  {education.degree} · {education.school}
                </h3>
                <p className="mt-1 font-mono text-[12px] text-ink-faint">
                  GPA {education.gpa}
                </p>
              </div>
            </div>
          </Block>

          {/* Certifications */}
          <Block label="certifications">
            <ul className="space-y-2">
              {certifications.map((c) => (
                <li
                  key={c.name}
                  className="grid gap-3 md:grid-cols-[140px_1fr] md:gap-8"
                >
                  <div className="font-mono text-[12px] text-ember-deep md:pt-1">
                    {c.issuer}
                  </div>
                  <div className="font-serif text-[16px] text-ink">
                    {c.name}
                  </div>
                </li>
              ))}
            </ul>
          </Block>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 break-inside-avoid">
      <div className="section-label mb-5">{`{ ${label} }`}</div>
      {children}
    </section>
  );
}
