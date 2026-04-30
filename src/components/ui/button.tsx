"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/60 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#7c5cff] via-[#8b6bff] to-[#22d3ee] text-white shadow-[0_10px_30px_-10px_rgba(124,92,255,0.7)] hover:brightness-110 hover:shadow-[0_18px_50px_-12px_rgba(124,92,255,0.85)]",
        ghost:
          "bg-white/[0.03] text-white/85 border border-white/10 hover:bg-white/[0.07] hover:text-white",
        outline:
          "border border-white/15 bg-transparent text-white/80 hover:bg-white/[0.06] hover:text-white",
        accent:
          "bg-[color:var(--color-accent)]/15 text-[#cabfff] border border-[color:var(--color-accent)]/25 hover:bg-[color:var(--color-accent)]/25",
        danger:
          "bg-[color:var(--color-danger)]/15 text-[#fecaca] border border-[color:var(--color-danger)]/25 hover:bg-[color:var(--color-danger)]/25",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
