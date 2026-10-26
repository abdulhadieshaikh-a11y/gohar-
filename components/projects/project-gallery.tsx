"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { IMAGE_KIND_LABELS, type ProjectImage } from "@/types/project";
import { ImageKindBadge } from "@/components/ui/image-kind-badge";

type GalleryImage = Pick<ProjectImage, "src" | "alt" | "kind" | "width" | "height">;

/**
 * Responsive gallery grid with an accessible lightbox:
 * native <dialog> (focus trap + Escape), arrow keys, swipe, and focus is
 * returned to the thumbnail that opened it.
 */
export function ProjectGallery({
  images,
  projectName,
  fit = "cover",
}: {
  images: GalleryImage[];
  projectName: string;
  /** "contain" shows whole images on a light ground in an even grid (floor plans, masterplans). */
  fit?: "cover" | "contain";
}) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStart = useRef<number | null>(null);
  const lastIndex = useRef(0);

  const open = index !== null;
  const count = images.length;

  const show = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (index !== null) lastIndex.current = index;
  }, [index]);

  const close = () => setIndex(null);

  const onDialogClose = () => {
    setIndex(null);
    triggerRefs.current[lastIndex.current]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (index === null) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      show(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      show(index - 1);
    }
  };

  const [first, ...rest] = images;
  if (!first) return null;
  const current = index !== null ? images[index] : null;

  return (
    <>
      <div
        className={`grid gap-3 ${
          fit === "contain"
            ? `sm:grid-cols-2 ${count >= 3 ? "lg:grid-cols-3" : ""}`
            : rest.length > 0
              ? "lg:grid-cols-3 lg:grid-rows-2"
              : ""
        }`}
      >
        {images.map((img, i) => {
          const isLead = fit === "cover" && i === 0 && rest.length > 0;
          // Images after the lead block flow in rows of three; the last one widens to close a gap.
          const extra = rest.length - 2;
          const fillSpan =
            fit === "cover" && extra > 0 && i === count - 1
              ? extra % 3 === 2
                ? "lg:col-span-2 lg:aspect-[8/3]"
                : extra % 3 === 1
                  ? "lg:col-span-3 lg:aspect-[4/1]"
                  : ""
              : "";
          return (
            <button
              key={img.src}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              type="button"
              onClick={() => show(i)}
              data-cursor="Expand"
              className={`group relative block overflow-hidden rounded-[1.1rem] text-left ${fit === "contain" ? "border border-line bg-paper" : "bg-ink-3"} ${
                isLead
                  ? "aspect-[4/3] lg:col-span-2 lg:row-span-2 lg:aspect-auto lg:min-h-[34rem]"
                  : fit === "contain"
                    ? "aspect-[4/3]"
                    : rest.length === 0
                      ? "aspect-[16/9]"
                      : "aspect-[4/3]"
              } ${fillSpan}`}
            >
              <span className={`absolute inset-0 ${fit === "contain" ? "p-3" : "zoom-media"}`}>
                <span className="relative block size-full">
                  <Image quality={85}
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={
                      fit === "contain"
                        ? "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        : isLead || rest.length === 0 || fillSpan
                          ? "(min-width: 1024px) 66vw, 100vw"
                          : "(min-width: 1024px) 33vw, 100vw"
                    }
                    className={fit === "contain" ? "object-contain transition-transform duration-700 group-hover:scale-[1.03]" : "object-cover"}
                  />
                </span>
              </span>
              <ImageKindBadge kind={img.kind} className="absolute bottom-3 left-3" />
              <span className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-ivory/90 text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand aria-hidden="true" className="size-4" />
              </span>
              <span className="sr-only">
                Open image {i + 1} of {count} in full screen
              </span>
            </button>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${projectName} gallery`}
        onClose={onDialogClose}
        onKeyDown={onKeyDown}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-ivory"
      >
        {current ? (
          <div
            className="flex h-full flex-col"
            onTouchStart={(e) => (touchStart.current = e.touches[0]?.clientX ?? null)}
            onTouchEnd={(e) => {
              const start = touchStart.current;
              const end = e.changedTouches[0]?.clientX;
              touchStart.current = null;
              if (start == null || end == null || index === null) return;
              if (Math.abs(end - start) > 50) show(index + (end < start ? 1 : -1));
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <p className="text-[0.8rem] tracking-wide text-stone" aria-live="polite">
                <span className="tabular-nums">
                  {index! + 1} / {count}
                </span>
                <span className="mx-2 opacity-40">·</span>
                {IMAGE_KIND_LABELS[current.kind]}
              </p>
              <button type="button" onClick={close} className="grid size-11 place-items-center hover:text-brass-light" autoFocus>
                <X aria-hidden="true" className="size-6" />
                <span className="sr-only">Close gallery</span>
              </button>
            </div>
            <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && close()}>
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                quality={90}
                className="animate-fade-in object-contain px-2 sm:px-20"
              />
              {count > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => show(index! - 1)}
                    className="absolute left-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-ivory/20 bg-ink/60 backdrop-blur hover:bg-ivory hover:text-ink sm:left-4"
                  >
                    <ChevronLeft aria-hidden="true" className="size-6" />
                    <span className="sr-only">Previous image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => show(index! + 1)}
                    className="absolute right-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-ivory/20 bg-ink/60 backdrop-blur hover:bg-ivory hover:text-ink sm:right-4"
                  >
                    <ChevronRight aria-hidden="true" className="size-6" />
                    <span className="sr-only">Next image</span>
                  </button>
                </>
              ) : null}
            </div>
            <p className="mx-auto max-w-3xl px-6 py-4 text-center text-[0.9rem] text-stone">{current.alt}</p>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
