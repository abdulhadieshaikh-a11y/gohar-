import { IMAGE_KIND_LABELS, type ImageKind } from "@/types/project";

/**
 * Small label that tells visitors whether an image is a photograph or a
 * render, so renders are never mistaken for completed buildings.
 */
export function ImageKindBadge({ kind, className = "" }: { kind: ImageKind; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-ink/65 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-ivory backdrop-blur-sm ${className}`}
    >
      {IMAGE_KIND_LABELS[kind]}
    </span>
  );
}
