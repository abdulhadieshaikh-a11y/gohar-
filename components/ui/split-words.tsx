import { Fragment, type CSSProperties } from "react";

/**
 * Wraps each word in a mask so it can rise into view (CSS on the hero via
 * `.hero-words`, or the motion system via data-reveal="words"). Words stay
 * ordinary inline text, so the heading reads normally to screen readers
 * and remains visible without JavaScript.
 */
export function SplitWords({
  text,
  em = false,
  start = 0,
  className,
}: {
  text: string;
  /** Render in italic (used for the accent part of a headline). */
  em?: boolean;
  /** Index of the first word, to continue a stagger across several parts. */
  start?: number;
  className?: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  const Tag = em ? "em" : "span";
  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="split-mask">
            <span style={{ "--i": start + i } as CSSProperties}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
