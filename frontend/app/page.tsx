"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

export default function LandingPage() {
  const router = useRouter();
  const { setLoading } = useUIStore();

  const handleStart = () => {
    setLoading(true);
    // 跳转到工作区
    router.push("/workspace");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-primary-950 dark:via-gray-950 dark:to-primary-900">
      <div className="text-center space-y-6 px-4">
        {/* Logo 占位 */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-3xl">✨</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          浅梦写作助手
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          AI 驱动的文本生成工具，让写作更轻松
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg" color="primary" onPress={handleStart}>
            开始使用
          </Button>
          <Button size="lg" variant="bordered" color="primary">
            了解更多
          </Button>
        </div>

        {/* 特性列表 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: "🤖",
    title: "AI 智能助手",
    description: "基于大语言模型的智能写作助手",
  },
  {
    icon: "📝",
    title: "多种工具",
    description: "润色、续写、大纲生成、语法检查",
  },
  {
    icon: "💡",
    title: "灵感保存",
    description: "随时保存闪现的创意灵感",
  },
];