import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import type { StoryBlock, StoryImage } from "@/types/story";
import { RichText } from "./rich-text";

function Figure({ image, wide }: { image: StoryImage; wide?: boolean }) {
  const portrait = image.height > image.width;
  return (
    <figure className={`my-12 ${wide ? "lg:-mx-16" : ""}`} data-reveal>
      <div
        className={`relative overflow-hidden bg-ink-3 ${portrait ? "mx-auto aspect-[4/5] max-w-md" : "aspect-[16/9]"}`}
      >
        <Image quality={85}
          src={image.src}
          alt={image.alt}
          fill
          sizes={portrait ? "(min-width: 768px) 28rem, 100vw" : "(min-width: 1024px) 50rem, 100vw"}
          className="object-cover"
        />
      </div>
      <figcaption className="mt-3 flex flex-col gap-1 border-l border-brass pl-3 text-[0.82rem] leading-relaxed text-muted sm:flex-row sm:justify-between sm:gap-6">
        {image.caption ? <span>{image.caption}</span> : <span />}
        <span className="shrink-0 text-[0.72rem] uppercase tracking-[0.12em]">{image.credit}</span>
      </figcaption>
    </figure>
  );
}

/** Renders a story's blocks with editorial typography. */
export function StoryBody({ blocks }: { blocks: StoryBlock[] }) {
  return (
    <div className="story-prose">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return (
              <p key={i} className={b.lead ? "story-lead" : undefined}>
                <RichText text={b.text} />
              </p>
            );
          case "h2":
            return (
              <h2 key={i} id={b.id} className="scroll-mt-32">
                {b.text}
              </h2>
            );
          case "h3":
            return <h3 key={i}>{b.text}</h3>;
          case "list":
            return (
              <ul key={i}>
                {b.items.map((item) => (
                  <li key={item}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            );
          case "tip":
            return (
              <section key={i} id={b.id} aria-labelledby={`${b.id}-title`} className="story-tip scroll-mt-32" data-reveal>
                <span aria-hidden="true" className="story-tip-number">
                  {String(b.number).padStart(2, "0")}
                </span>
                <div>
                  <h2 id={`${b.id}-title`}>
                    <span className="sr-only">Tip {b.number}: </span>
                    {b.title}
                  </h2>
                  <p>
                    <RichText text={b.text} />
                  </p>
                </div>
              </section>
            );
          case "image":
            return <Figure key={i} image={b.image} wide />;
          case "contact":
            return (
              <aside key={i} className="my-10 border border-line bg-paper p-6 sm:p-8">
                <p className="eyebrow text-brass-deep">{b.title}</p>
                <ul className="mt-4 space-y-2 !pl-0">
                  {b.lines.map((l) => (
                    <li key={l} className="flex gap-3 !pl-0 before:!hidden">
                      {/^call/i.test(l) ? (
                        <Phone aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-gohar" />
                      ) : (
                        <MapPin aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-gohar" />
                      )}
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
