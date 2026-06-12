"use client";

import { Card as NextUICard, CardBody, CardHeader, CardFooter } from "@nextui-org/react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <NextUICard className={cn("shadow-sm", className)}>
      {children}
    </NextUICard>
  );
}

Card.Header = function CardHeaderComponent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <CardHeader className={cn("pb-0", className)}>{children}</CardHeader>;
};

Card.Body = function CardBodyComponent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <CardBody className={cn("py-4", className)}>{children}</CardBody>;
};

Card.Footer = function CardFooterComponent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <CardFooter className={cn("pt-0", className)}>{children}</CardFooter>;
};