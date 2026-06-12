"use client";

import { Spinner as NextUISpinner } from "@nextui-org/react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  label?: string;
  className?: string;
}

export function Spinner({ size = "md", color = "primary", label, className }: SpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <NextUISpinner size={size} color={color} />
      {label && <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>}
    </div>
  );
}