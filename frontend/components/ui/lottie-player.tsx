"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// 动态导入 lottie-react，避免 SSR 问题
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-full" />,
});

interface LottiePlayerProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  height?: number | string;
  width?: number | string;
  speed?: number;
}

export function LottiePlayer({
  animationData,
  loop = true,
  autoplay = true,
  className = "",
  height = "auto",
  width = "auto",
  speed = 1,
}: LottiePlayerProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={cn("transition-all duration-200", className)}
      style={{ height, width }}
      speed={speed}
    />
  );
}