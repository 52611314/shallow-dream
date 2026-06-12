import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // 状态
  sidebarCollapsed: boolean;
  theme: "light" | "dark" | "system";
  isLoading: boolean;
  activeTab: "chat" | "documents" | "ideas";  // 侧边栏 Tab
  
  // 操作
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: "chat" | "documents" | "ideas") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // 初始状态
      sidebarCollapsed: false,
      theme: "system",
      isLoading: false,
      activeTab: "chat",
      
      // 操作
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
      
      setTheme: (theme) => set({ theme }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "ui-storage",  // localStorage key
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        activeTab: state.activeTab,
      }),
    }
  )
);