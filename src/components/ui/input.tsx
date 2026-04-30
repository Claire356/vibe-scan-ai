"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-white",
          "placeholder:text-white/35 outline-none transition-all duration-200",
          "focus:border-[color:var(--color-accent)]/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-[color:var(--color-accent)]/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
