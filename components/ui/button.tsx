import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost-light" | "solid-light" | "on-red" | "text";
type Size = "md" | "lg";

// Confident pill buttons in sentence case. A Gohar-red fill sweeps up from the
// bottom on hover/focus (a ::before layer; the button isolates its own stacking context).
// Use "primary" on light surfaces and "solid-light" on dark ones.
const base =
  "relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-semibold tracking-[-0.01em] whitespace-nowrap " +
  "transition-[color,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed disabled:opacity-60 " +
  "before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-[inherit] before:transition-transform before:duration-[600ms] before:ease-[cubic-bezier(0.76,0,0.24,1)] " +
  "hover:before:scale-y-100 focus-visible:before:scale-y-100 motion-reduce:before:transition-none";

const variants: Record<Variant, string> = {
  // Obsidian on light surfaces (18:1), sweeping to Gohar red.
  primary: "bg-ink text-ivory border border-ink before:bg-gohar-deep hover:border-gohar-deep focus-visible:border-gohar-deep",
  secondary: "border border-ink/20 text-ink before:bg-ink hover:text-ivory hover:border-ink focus-visible:text-ivory",
  "ghost-light": "border border-ivory/30 text-ivory bg-ivory/[0.06] backdrop-blur-md before:bg-ivory hover:text-ink hover:border-ivory focus-visible:text-ink",
  // Bone on dark surfaces, sweeping to Gohar red.
  "solid-light": "bg-ivory text-ink border border-ivory before:bg-gohar-deep hover:text-ivory hover:border-gohar-deep focus-visible:text-ivory",
  // Kept for existing call sites on the dark feature surface.
  "on-red": "bg-ivory text-ink border border-ivory before:bg-gohar-deep hover:text-ivory hover:border-gohar-deep focus-visible:text-ivory",
  text: "!rounded-none !overflow-visible before:hidden text-ink hover:text-gohar-deep link-line px-0",
};

const sizes: Record<Size, string> = {
  md: "text-[0.875rem] min-h-12 px-6 py-3",
  lg: "text-[0.95rem] min-h-14 px-8 py-3.5",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = "") {
  return [base, variants[variant], variant === "text" ? "text-[0.9rem] py-1" : sizes[size], extra].join(" ");
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", size = "md", className = "", children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant = "primary", size = "md", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}
