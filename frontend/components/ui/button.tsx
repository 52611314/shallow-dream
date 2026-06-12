"use client";

import { Button as NextUIButton } from "@nextui-org/react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ComponentProps<typeof NextUIButton> {
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <NextUIButton
      className={cn(
        "transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </NextUIButton>
  );
}