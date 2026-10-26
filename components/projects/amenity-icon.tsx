import {
  Building2,
  Dumbbell,
  Laptop,
  PartyPopper,
  ShoppingBag,
  Sparkles,
  Trees,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from "lucide-react";

/** Picks a fitting icon for an amenity label (falls back to a neutral mark). */
const RULES: [RegExp, LucideIcon][] = [
  [/pool|swim/i, Waves],
  [/garden|park|green/i, Trees],
  [/gym|fitness/i, Dumbbell],
  [/co-?working|office|work/i, Laptop],
  [/restaurant|dining|food/i, UtensilsCrossed],
  [/banquet|event|hall/i, PartyPopper],
  [/entertainment/i, Sparkles],
  [/shop|retail|commercial|outlet|mall/i, ShoppingBag],
];

export function AmenityIcon({ label, className = "size-5" }: { label: string; className?: string }) {
  const Icon = RULES.find(([re]) => re.test(label))?.[1] ?? Building2;
  return <Icon aria-hidden="true" className={className} strokeWidth={1.5} />;
}
