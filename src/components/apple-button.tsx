"use client";

import { type ButtonHTMLAttributes } from "react";

export function AppleButton({
  className,
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  const base = "inline-flex items-center justify-center h-9 px-5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out";
  const variants = {
    primary:
      "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[1px] hover:opacity-90",
    secondary:
      "bg-secondary text-secondary-foreground border shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-[1px]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
