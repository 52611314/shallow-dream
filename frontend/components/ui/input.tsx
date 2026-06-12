"use client";

import { Input as NextUIInput } from "@nextui-org/react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<typeof NextUIInput> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <NextUIInput
      className={cn("transition-all duration-200", className)}
      {...props}
    />
  );
}