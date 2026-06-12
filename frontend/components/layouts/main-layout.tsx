"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

interface MainLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏 */}
      <aside
        className={cn(
          "h-full transition-all duration-300 ease-in-out flex-shrink-0",
          sidebarCollapsed ? "w-14" : "w-64"
        )}
      >
        {sidebar}
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}