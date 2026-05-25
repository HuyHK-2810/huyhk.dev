import Section from "./section";

export default function PullQuote() {
  return (
    <Section divider className="bg-paper-pure">
      <blockquote className="reveal text-center">
        <p className="font-serif text-[clamp(24px,3.4vw,34px)] font-light italic leading-[1.35] text-ink">
          <span className="mr-1 text-ember">&ldquo;</span>
          Every bug I fix in production is a test case I should have written
          first.
          <span className="ml-1 text-ember">&rdquo;</span>
        </p>
        <cite className="mt-5 block font-mono text-[13px] not-italic text-ink-faint">
          — a rule I keep relearning
        </cite>
      </blockquote>
    </Section>
  );
}
