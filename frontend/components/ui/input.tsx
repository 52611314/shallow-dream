"use client";

import { Input as NextUIInput, type InputProps as NextUIInputProps } from "@nextui-org/react";
import { cn } from "@/lib/utils";

interface InputProps extends NextUIInputProps {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return (
    <NextUIInput
      className={cn("transition-all duration-200", className)}
      {...props}
    />
  );
}