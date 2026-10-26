import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Renders the two inline markups used in story text: **bold** and
 * [link text](/path). Internal paths use client-side navigation; anything
 * else opens in a new tab. No HTML is ever injected.
 */
export function RichText({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}

function renderInline(text: string, keyPrefix = ""): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(<Fragment key={`${keyPrefix}t${i}`}>{text.slice(last, match.index)}</Fragment>);
    if (match[1] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}b${i}`} className="font-semibold text-ink">
          {renderInline(match[1], `${keyPrefix}b${i}-`)}
        </strong>,
      );
    } else {
      const href = match[3]!;
      const label = renderInline(match[2]!, `${keyPrefix}l${i}-`);
      out.push(
        href.startsWith("/") ? (
          <Link key={`${keyPrefix}l${i}`} href={href} className="story-link">
            {label}
          </Link>
        ) : (
          <a key={`${keyPrefix}l${i}`} href={href} target="_blank" rel="noopener noreferrer" className="story-link">
            {label}
          </a>
        ),
      );
    }
    last = pattern.lastIndex;
    i++;
  }
  if (last < text.length) out.push(<Fragment key={`${keyPrefix}t${i}`}>{text.slice(last)}</Fragment>);
  return out;
}
