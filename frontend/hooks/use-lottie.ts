"use client";

import { useState, useEffect } from "react";

export function useLottieAnimation(path: string) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`加载失败: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setAnimationData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [path]);

  return { animationData, loading, error };
}