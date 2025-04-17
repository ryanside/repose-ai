"use client";

import CodePlayground from "@/components/code-playground";
import { useEffect } from "react";
import { useAppContext } from "@/lib/app-context";

export default function CodePage() {
  const { setShowModeSwitcher } = useAppContext();

  // Hide the mode switcher when in code playground
  useEffect(() => {
    setShowModeSwitcher(false);
    return () => setShowModeSwitcher(true);
  }, [setShowModeSwitcher]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <CodePlayground />
    </div>
  );
}
