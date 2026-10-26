import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-orange-500/20 text-orange-300",
        secondary: "border-transparent bg-slate-700 text-slate-300",
        destructive: "border-transparent bg-red-500/20 text-red-300",
        outline: "text-slate-300 border-slate-700",
        success: "border-transparent bg-emerald-500/20 text-emerald-300",
        info: "border-transparent bg-blue-500/20 text-blue-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
