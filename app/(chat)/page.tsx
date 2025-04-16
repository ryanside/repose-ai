"use client";

import { useState, useEffect } from "react";
import ExploreMode from "@/components/explore-mode";
import LearnMode from "@/components/learn-mode";
import { useAppContext } from "@/lib/app-context";

export default function Chat() {
  const [mode, setMode] = useState<"explore" | "learn">("explore");
  const { setShowModeSwitcher } = useAppContext();

  // Use useEffect to set the showModeSwitcher state
  useEffect(() => {
    // Hide the original mode switcher since we're handling it in ChatInput
    setShowModeSwitcher(false);

    // Cleanup function to restore the mode switcher if the component unmounts
    return () => {
      setShowModeSwitcher(true);
    };
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {mode === "explore" ? (
        <ExploreMode key={`explore-${Date.now()}`} modeHandler={setMode} />
      ) : (
        <LearnMode key={`learn-${Date.now()}`} modeHandler={setMode} />
      )}
    </div>
  );
}
