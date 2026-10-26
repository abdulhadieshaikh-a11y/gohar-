import Image from "next/image";
import Link from "next/link";

/**
 * Official Gohar Group of Companies logo (from gohargoc.com).
 * `tone="light"` is the white version for dark backgrounds.
 */
export function Logo({
  tone = "dark",
  className = "h-10 w-auto",
  priority = false,
}: {
  tone?: "dark" | "light";
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Gohar Group of Companies, home">
      <Image quality={85}
        src={tone === "light" ? "/images/brand/gohar-logo-light.png" : "/images/brand/gohar-logo-dark.png"}
        alt=""
        width={1920}
        height={627}
        className={className}
        sizes="180px"
        preload={priority}
      />
    </Link>
  );
}
