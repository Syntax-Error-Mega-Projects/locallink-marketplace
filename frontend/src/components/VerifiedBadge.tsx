import { ShieldCheck } from "lucide-react";

export default function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const cls = size === "md" ? "text-sm px-3 py-1" : "text-xs px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1 ${cls} rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30`}>
      <ShieldCheck className={size === "md" ? "w-4 h-4" : "w-3 h-3"} />
      Verified
    </span>
  );
}
