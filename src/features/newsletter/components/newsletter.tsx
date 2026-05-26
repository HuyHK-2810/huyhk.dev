"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "already" | "error";

type Props = {
  variant?: "section" | "compact";
  locale?: "en" | "vi";
};

const COPY = {
  en: {
    eyebrow: "{ subscribe }",
    title: "New notes, in your inbox.",
    lede:
      "Once or twice a month I send a short note about something I'm learning — usually about shipping, sometimes about agents. No spam, unsubscribe in one click.",
    placeholder: "your@email.com",
    submit: "Subscribe",
    submitting: "Sending…",
    success: "You're on the list. Thanks for trusting me with the inbox space.",
    already: "Looks like you're already subscribed. ✓",
    error: "Hmm, something broke. Try again in a moment?",
    invalid: "That doesn't look like an email.",
    privacy: "No spam. Just writing. Unsubscribe any time.",
    perks: [
      "One short essay per month",
      "Real stories from production",
      "Zero growth-hacky listicles",
    ],
  },
  vi: {
    eyebrow: "{ đăng ký }",
    title: "Bài mới, thẳng vào hộp thư của bạn.",
    lede:
      "Một hoặc hai lần mỗi tháng, tôi gửi một bài ngắn về thứ tôi đang học — phần lớn về việc ship sản phẩm, đôi khi về agents. Không spam, hủy đăng ký một cú click.",
    placeholder: "email@cuaban.com",
    submit: "Đăng ký",
    submitting: "Đang gửi…",
    success: "Bạn đã có trong danh sách. Cảm ơn vì niềm tin với hộp thư.",
    already: "Có vẻ bạn đã đăng ký rồi. ✓",
    error: "Có gì đó hỏng. Thử lại sau ít phút nhé?",
    invalid: "Email này nhìn chưa hợp lệ.",
    privacy: "Không spam. Chỉ là bài viết. Hủy đăng ký bất cứ lúc nào.",
    perks: [
      "Một bài ngắn mỗi tháng",
      "Câu chuyện thật từ production",
      "Không có listicle 'tăng trưởng'",
    ],
  },
} as const;

export default function Newsletter({ variant = "section", locale = "en" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<"invalid" | "error" | null>(null);

  const t = COPY[locale];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setErrorKey("invalid");
      return;
    }

    setStatus("loading");
    setErrorKey(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorKey("error");
        return;
      }
      if (data.already) {
        setStatus("already");
      } else {
        setStatus("success");
      }
      setEmail("");
    } catch {
      setStatus("error");
      setErrorKey("error");
    }
  }

  // Compact variant: thin inline form (used on post pages or footer)
  if (variant === "compact") {
    return (
      <div className="rounded-md border border-[var(--line-soft)] bg-paper-pure p-5">
        <div className="section-label mb-2">{t.eyebrow}</div>
        <h3 className="font-serif text-[20px] font-medium leading-snug text-ink">
          {t.title}
        </h3>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            placeholder={t.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-md border border-[var(--line)] bg-paper px-3 py-2 text-[14px]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-md bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-paper-pure hover:bg-ember disabled:opacity-60"
          >
            {status === "loading" ? t.submitting : t.submit}
          </button>
        </form>
        <div className="mt-2 min-h-[1rem] font-mono text-[11px] text-ink-faint">
          {status === "success" && <span className="text-ember-deep">{t.success}</span>}
          {status === "already" && t.already}
          {status === "error" && errorKey === "invalid" && t.invalid}
          {status === "error" && errorKey === "error" && t.error}
          {(status === "idle" || status === "loading") && t.privacy}
        </div>
      </div>
    );
  }

  // Full section variant: editorial card with decorative quote + perks list
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-paper-pure">
      {/* Decorative dot grid corner */}
      <div
        aria-hidden
        className="dot-grid absolute -right-8 -top-8 h-40 w-40 opacity-50"
      />
      <div
        aria-hidden
        className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--ember-soft) 0%, transparent 70%)",
        }}
      />

      <div className="relative grid gap-10 p-8 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:p-12">
        {/* Left: pitch */}
        <div className="flex flex-col gap-5">
          <div className="section-label">{t.eyebrow}</div>
          <h3 className="font-serif text-[clamp(26px,3vw,36px)] font-normal leading-[1.15] tracking-tight text-ink">
            {locale === "vi" ? (
              <>
                Bài mới, thẳng vào{" "}
                <span className="italic text-ember">hộp thư</span> của bạn.
              </>
            ) : (
              <>
                New notes,{" "}
                <span className="italic text-ember">in your inbox</span>.
              </>
            )}
          </h3>
          <p className="font-serif text-[17px] font-light leading-[1.6] text-ink-soft">
            {t.lede}
          </p>
          <ul className="mt-2 space-y-2 font-mono text-[13px] text-ink-soft">
            {t.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2">
                <span aria-hidden className="mt-1 text-ember">
                  →
                </span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-center gap-4">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <label
              htmlFor="newsletter-email"
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint"
            >
              {locale === "vi" ? "email của bạn" : "your email"}
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              autoComplete="email"
              placeholder={t.placeholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (
                  status === "error" ||
                  status === "success" ||
                  status === "already"
                ) {
                  setStatus("idle");
                  setErrorKey(null);
                }
              }}
              disabled={status === "loading"}
              className="rounded-md border border-[var(--line)] bg-paper px-4 py-3 font-sans text-[16px] text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-px hover:bg-ember disabled:opacity-60"
            >
              {status === "loading" ? t.submitting : t.submit}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          </form>

          <div className="min-h-[1.5rem] font-mono text-[12px] leading-[1.4]">
            {status === "success" && (
              <span className="text-ember-deep">{t.success}</span>
            )}
            {status === "already" && <span className="text-ink-soft">{t.already}</span>}
            {status === "error" && errorKey === "invalid" && (
              <span className="text-[#C24A1F]">{t.invalid}</span>
            )}
            {status === "error" && errorKey === "error" && (
              <span className="text-[#C24A1F]">{t.error}</span>
            )}
            {(status === "idle" || status === "loading") && (
              <span className="text-ink-faint">{t.privacy}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
