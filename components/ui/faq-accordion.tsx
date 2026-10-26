import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQ list built on native <details>/<summary>: keyboard and screen-reader
 * accessible, works without JavaScript. Optionally emits FAQPage data.
 */
export function FaqAccordion({
  items,
  tone = "light",
  structuredData = false,
  footer,
}: {
  items: FaqItem[];
  tone?: "light" | "dark";
  structuredData?: boolean;
  footer?: ReactNode;
}) {
  const answerColor = tone === "dark" ? "text-stone" : "text-muted";
  const lineColor = tone === "dark" ? "[&_details]:border-ivory/15" : "";
  return (
    <div className={`accordion border-t ${tone === "dark" ? "border-ivory/15" : "border-line"} ${lineColor}`}>
      {items.map((item, i) => (
        <details key={item.question} name="faq" open={i === 0}>
          <summary>
            <span className="font-display text-[1.45rem] leading-snug sm:text-[1.7rem]">{item.question}</span>
            <span
              className={`accordion-icon grid size-10 place-items-center rounded-full border ${tone === "dark" ? "border-ivory/25" : "border-stone"}`}
            >
              <Plus aria-hidden="true" className="size-4" />
            </span>
          </summary>
          <div>
            <p className={`max-w-2xl leading-relaxed ${answerColor}`}>{item.answer}</p>
          </div>
        </details>
      ))}
      {footer}
      {structuredData ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }}
        />
      ) : null}
    </div>
  );
}
