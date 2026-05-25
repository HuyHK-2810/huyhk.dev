import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="font-serif text-[28px] font-medium leading-snug text-ink">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 font-serif text-[24px] font-medium leading-snug text-ink">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 font-serif text-[20px] font-medium leading-snug text-ink">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mt-5 text-[17px] leading-[1.7] text-ink-soft">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mt-4 ml-6 list-disc space-y-1 text-[17px] leading-[1.65] text-ink-soft">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 ml-6 list-decimal space-y-1 text-[17px] leading-[1.65] text-ink-soft">
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-ember pl-5 font-serif text-[18px] italic text-ink">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-ember underline decoration-ember/40 underline-offset-2 hover:decoration-ember"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="rounded bg-[var(--line-soft)] px-1.5 py-0.5 font-mono text-[14px] text-ink">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="my-6 overflow-x-auto rounded-md border border-[var(--line)] bg-paper-pure p-4 font-mono text-[13px] text-ink">
        {children}
      </pre>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    strong: ({ children }) => <strong className="font-medium text-ink">{children}</strong>,
    hr: () => <hr className="my-10 border-t border-[var(--line-soft)]" />,
    ...components,
  };
}
