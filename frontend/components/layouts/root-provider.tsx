"use client";

import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";

interface RootProviderProps {
  children: React.ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <NextUIProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </NextUIProvider>
  );
}