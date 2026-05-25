import type { MDXComponents } from "mdx/types";
import type { ReactNode, HTMLAttributes } from "react";

type CalloutProps = { type?: "note" | "warn" | "tip" | "quote"; title?: string; children: ReactNode };

function Callout({ type = "note", title, children }: CalloutProps) {
  const palette = {
    note: { border: "border-l-ember", bg: "bg-ember-soft", label: "Note" },
    warn: { border: "border-l-[#C24A1F]", bg: "bg-[#FFF1EB]", label: "Heads up" },
    tip: { border: "border-l-[#2E7D32]", bg: "bg-[#EEF7EE]", label: "Tip" },
    quote: { border: "border-l-ink", bg: "bg-paper-pure", label: "Story" },
  }[type];

  return (
    <aside
      className={`my-8 rounded-md border border-[var(--line-soft)] border-l-[3px] ${palette.border} ${palette.bg} px-5 py-4`}
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember-deep">
        {title ?? palette.label}
      </div>
      <div className="mt-2 [&>p:first-child]:mt-0 [&>p]:mt-3 [&>p]:text-[16px] [&>p]:leading-[1.65] [&>p]:text-ink">
        {children}
      </div>
    </aside>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="font-serif text-[28px] font-medium leading-snug text-ink">
        {children}
      </h1>
    ),
    h2: ({ children, id }) => (
      <h2
        id={id}
        className="group mt-12 scroll-mt-24 font-serif text-[26px] font-medium leading-snug text-ink"
      >
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3
        id={id}
        className="group mt-8 scroll-mt-24 font-serif text-[21px] font-medium leading-snug text-ink"
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mt-5 text-[17px] leading-[1.75] text-ink-soft">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mt-4 ml-6 list-disc space-y-2 text-[17px] leading-[1.7] text-ink-soft marker:text-ember">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 ml-6 list-decimal space-y-2 text-[17px] leading-[1.7] text-ink-soft marker:text-ember-deep">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-ember pl-5 font-serif text-[19px] italic leading-[1.55] text-ink">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-ember underline decoration-ember/40 underline-offset-[3px] transition-colors hover:decoration-ember"
      >
        {children}
      </a>
    ),
    code: ({ children, className, ...rest }: HTMLAttributes<HTMLElement>) => {
      // Block code is wrapped by <pre>, so we only style inline here.
      // rehype-pretty-code passes `data-language` on block <code>; inline code has neither.
      const isBlock = className?.includes("language-");
      if (isBlock) {
        return (
          <code className={className} {...rest}>
            {children}
          </code>
        );
      }
      return (
        <code className="rounded border border-[var(--line-soft)] bg-paper-pure px-1.5 py-0.5 font-mono text-[14px] text-ember-deep">
          {children}
        </code>
      );
    },
    pre: ({ children, ...rest }) => (
      <pre
        {...rest}
        className="my-7 overflow-x-auto rounded-md border border-[var(--line)] bg-[#fafafa] p-4 font-mono text-[13.5px] leading-[1.65] [&>code]:bg-transparent [&>code]:p-0"
      >
        {children}
      </pre>
    ),
    em: ({ children }) => <em className="italic text-ink">{children}</em>,
    strong: ({ children }) => (
      <strong className="font-medium text-ink">{children}</strong>
    ),
    hr: () => (
      <hr className="my-12 border-0 text-center after:content-['×_×_×'] after:font-mono after:text-[14px] after:tracking-[0.4em] after:text-ink-faint" />
    ),
    Callout,
    ...components,
  };
}
