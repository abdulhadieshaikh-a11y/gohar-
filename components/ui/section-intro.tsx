import type { ReactNode } from "react";
import { SplitWords } from "./split-words";

interface SectionIntroProps {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  /** Visual tone of the surrounding section. */
  tone?: "light" | "dark";
  align?: "left" | "center";
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  /** Optional section number shown before the eyebrow, e.g. 1 → "(01)". */
  index?: number;
  /** Heading size. */
  size?: "md" | "lg";
}

/**
 * Section heading: an indexed label with a Gohar-red hairline that draws in,
 * a display heading whose words rise out of masks as it scrolls in, and an
 * optional lead paragraph.
 */
export function SectionIntro({
  eyebrow,
  title,
  children,
  tone = "light",
  align = "left",
  as: Heading = "h2",
  id,
  className = "",
  index,
  size = "md",
}: SectionIntroProps) {
  const eyebrowColor = tone === "dark" ? "text-brass-light" : "text-brass-deep";
  const indexColor = tone === "dark" ? "text-gohar" : "text-gohar-deep";
  const leadColor = tone === "dark" ? "text-stone" : "text-muted";
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      <p className={`eyebrow ${eyebrowColor} flex items-center gap-4 ${align === "center" ? "justify-center" : ""}`} data-reveal="fade">
        {index !== undefined ? <span className={`num tracking-[0.1em] ${indexColor}`}>({String(index).padStart(2, "0")})</span> : null}
        <span className="block h-px w-10 origin-left bg-gohar" aria-hidden="true" data-reveal="line" />
        {eyebrow}
      </p>
      <Heading
        id={id}
        className={`mt-6 ${size === "lg" ? "display-lg" : "display-md"}`}
        data-reveal={typeof title === "string" ? "words" : "up"}
      >
        {typeof title === "string" ? <SplitWords text={title} /> : title}
      </Heading>
      {children ? (
        <div className={`mt-6 max-w-xl text-[1.02rem] leading-relaxed ${leadColor} ${align === "center" ? "mx-auto" : ""}`} data-reveal>
          {children}
        </div>
      ) : null}
    </div>
  );
}
