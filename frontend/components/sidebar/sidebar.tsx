"use client";

import { SessionList } from "./session-list";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { Moon, Sun, PanelLeftClose, PanelLeft } from "lucide-react";
import { useTheme } from "next-themes";

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();

  // 侧边栏收起时：只显示展开按钮
  if (sidebarCollapsed) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4">
        <Button
          onPress={toggleSidebar}
          isIconOnly
          size="sm"
          variant="light"
        >
          <PanelLeft size={18} />
        </Button>
      </div>
    );
  }

  // 侧边栏展开时：显示完整内容
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <SessionList />
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <Button
            onPress={toggleSidebar}
            isIconOnly
            size="sm"
            variant="light"
          >
            <PanelLeftClose size={16} />
          </Button>
          
          <Button
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
            isIconOnly
            size="sm"
            variant="light"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}