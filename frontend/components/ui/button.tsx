"use client";

import { Button as NextUIButton, type ButtonProps as NextUIButtonProps } from "@nextui-org/react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ButtonProps extends NextUIButtonProps {
  children?: ReactNode;
  className?: string;
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