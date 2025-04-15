"use client";

import { memo } from "react";
import { BookOpen, Maximize2, Sparkles } from "lucide-react";

export default memo(ChatHeader);

function ChatHeader({
  firstMessageContent,
  toggleView,
  mobileView,
  mode = "explore",
}: {
  firstMessageContent: string;
  toggleView?: () => void;
  mobileView?: "chat" | "flow";
  mode?: "explore" | "learn";
}) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {mode === "explore" ? (
          <Sparkles className="text-primary" size={18} />
        ) : (
          <BookOpen className="text-primary" size={18} />
        )}
        <h1 className="font-medium line-clamp-1 text-sm sm:text-base">
          {firstMessageContent
            ? firstMessageContent.substring(0, 60) +
              (firstMessageContent.length > 60 ? "..." : "")
            : "New Chat"}
        </h1>
      </div>

      {/* Only show expand view button in explore mode */}
      {mode === "explore" && toggleView && (
        <button
          onClick={toggleView}
          className="p-2 hover:bg-muted rounded-md text-muted-foreground md:hidden"
        >
          <Maximize2 size={18} />
          <span className="sr-only">
            {mobileView === "chat" ? "View Flow" : "View Chat"}
          </span>
        </button>
      )}
    </div>
  );
}
