"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import ExploreMode from "./explore-mode";
import LearnMode from "./learn-mode";

export default function ModeSwitcher() {
  const [mode, setMode] = useState<"explore" | "learn">("explore");

  return (
    <div className="flex flex-col min-h-full w-full overflow-x-hidden">
      {/* Mode Switcher */}
      <div className="flex justify-center mt-2 mb-1 z-20">
        <div className="grid grid-cols-2 gap-2 bg-muted/30 backdrop-blur-sm p-1 rounded-xl border">
          <Button
            variant={mode === "explore" ? "default" : "ghost"}
            onClick={() => setMode("explore")}
            className="rounded-lg"
            size="sm"
          >
            🌌 Explore
          </Button>
          <Button
            variant={mode === "learn" ? "default" : "ghost"}
            onClick={() => setMode("learn")}
            className="rounded-lg"
            size="sm"
          >
            📚 Learn
          </Button>
        </div>
      </div>

      {/* Content based on mode */}
      {mode === "explore" ? <ExploreMode /> : <LearnMode />}
    </div>
  );
}
