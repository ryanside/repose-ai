"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, BookOpen, Rocket } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default memo(ChatInput);

const placeholderPrompts = [
  "The newest LLM models",
  "Explain quantum computing",
  "Creative writing prompts about space",
  "Best practices for React development",
  "Summarize the latest AI research papers",
];

function ChatInput({
  onboarding = false,
  submitUserMessage,
  input,
  handleInputChange,
  mode = "explore",
  setMode,
}: {
  onboarding: boolean;
  submitUserMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  mode?: "explore" | "learn";
  setMode?: (mode: "explore" | "learn") => void;
}) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    placeholderPrompts[0]
  );
  const [isFading, setIsFading] = useState(false);

  // Handle rotating placeholders in explore mode
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    let fadeTimeoutId: NodeJS.Timeout | undefined;

    if (onboarding && mode === "explore") {
      intervalId = setInterval(() => {
        setIsFading(true);
        fadeTimeoutId = setTimeout(() => {
          setPlaceholderIndex(
            (prevIndex) => (prevIndex + 1) % placeholderPrompts.length
          );
          setIsFading(false);
        }, 500);
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (fadeTimeoutId) clearTimeout(fadeTimeoutId);
    };
  }, [onboarding, mode]);

  useEffect(() => {
    if (onboarding && !isFading && mode === "explore") {
      setCurrentPlaceholder(placeholderPrompts[placeholderIndex]);
    }
  }, [placeholderIndex, onboarding, isFading, mode]);

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const formEvent = e as unknown as React.FormEvent<HTMLFormElement>;
      submitUserMessage(formEvent);
    }
  };

  if (onboarding) {
    return (
      <div className="flex flex-col flex-1 max-w-7xl w-full gap-8 items-center mx-auto mt-4 pt-12 px-4 xs:pl-8 xs:pr-14 md:pt-[25vh] lg:mt-6 2xl:pr-20 max-sm:!px-1">
        <div className="flex w-full flex-col items-center mx-auto gap-7 max-md:pt-4 max-w-2xl">
          <h1 className="text-4xl font-medium tracking-tight">
            {mode === "explore" ? (
              <>
                🌌 lets{" "}
                <span className="text-primary dark:text-accent">explore</span>{" "}
                it
              </>
            ) : (
              <>
                📚 lets{" "}
                <span className="text-primary dark:text-accent">learn</span> it
              </>
            )}
          </h1>

          {/* Mode switcher */}
          {setMode && (
            <div className="grid grid-cols-2 gap-2 bg-muted/30 backdrop-blur-sm p-1 rounded-xl border w-full max-w-xs">
              <Button
                variant={mode === "explore" ? "default" : "ghost"}
                onClick={() => setMode("explore")}
                className="rounded-lg flex gap-2 items-center"
                size="sm"
              >
                <Rocket className="size-4" />
                Explore
              </Button>
              <Button
                variant={mode === "learn" ? "default" : "ghost"}
                onClick={() => setMode("learn")}
                className="rounded-lg flex gap-2 items-center"
                size="sm"
              >
                <BookOpen className="size-4" />
                Learn
              </Button>
            </div>
          )}
        </div>

        <div className="w-full max-w-2xl px-2">
          {mode === "explore" ? (
            <form onSubmit={submitUserMessage}>
              <div className="relative flex flex-col w-full gap-4">
                <div className="relative flex flex-col">
                  {input.length === 0 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-3 left-4 text-muted-foreground pointer-events-none tracking-wide text-sm",
                        "transition-opacity duration-500 ease-in-out",
                        isFading ? "opacity-0" : "opacity-100"
                      )}
                    >
                      {currentPlaceholder}
                    </span>
                  )}
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder=""
                    className="min-h-[120px] sm:min-h-[150px] resize-none rounded-2xl px-4 py-3 shadow-sm font-medium tracking-wide relative bg-transparent caret-primary"
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="absolute bottom-0 w-full flex justify-between items-center px-3 sm:px-4 pb-3">
                  <Select>
                    <SelectTrigger className="w-[100px] sm:w-[180px]">
                      <SelectValue placeholder="gemini 2.0 flash" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      <SelectItem value="gemini-2.0-flash">
                        gemini 2.0 flash
                      </SelectItem>
                      <SelectItem value="gemini-2.0-flash-lite">
                        gemini 2.0 flash-lite
                      </SelectItem>
                      <SelectItem value="gemini-2.5-pro">
                        gemini 2.5 pro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    variant="default"
                    size="icon"
                    className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                  >
                    <ArrowUp className="size-5" />
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <form
              onSubmit={submitUserMessage}
              className="bg-accent/10 p-6 rounded-3xl border border-accent/20"
            >
              <div className="relative flex flex-col w-full gap-4">
                <div className="flex flex-col">
                  <label
                    htmlFor="learn-topic"
                    className="text-sm font-medium mb-2 ml-1"
                  >
                    What would you like to learn about?
                  </label>
                  <Textarea
                    id="learn-topic"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Try: Python basics, History of jazz, Climate science..."
                    className="min-h-[120px] sm:min-h-[150px] resize-none rounded-xl px-4 py-3 shadow-sm font-medium tracking-wide bg-background"
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <Button
                  type="submit"
                  variant="default"
                  className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer w-full py-6 mt-2"
                >
                  Start Learning
                  <span className="ml-2">→</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Regular chat mode (not onboarding)
  if (mode === "explore") {
    return (
      <form
        onSubmit={submitUserMessage}
        className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 rounded-2xl w-[95%] sm:w-full max-w-xl lg:max-w-3xl bg-background/30 backdrop-blur-sm z-50"
      >
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Enter your topic..."
              onKeyDown={handleKeyDown}
              className="min-h-[100px] resize-none rounded-2xl px-3 sm:px-4 py-3 shadow-sm font-medium tracking-wide"
            />
          </div>
          <div className="absolute bottom-0 w-full flex justify-between items-center px-3 sm:px-4 pb-3">
            <Select>
              <SelectTrigger className="w-[150px] sm:w-[180px]">
                <SelectValue placeholder="gemini 2.0 flash" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2">
                <SelectItem value="gemini-2.0-flash">
                  gemini 2.0 flash
                </SelectItem>
                <SelectItem value="gemini-2.0-flash-lite">
                  gemini 2.0 flash-lite
                </SelectItem>
                <SelectItem value="gemini-2.5-pro">gemini 2.5 pro</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              variant="default"
              size="icon"
              className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
            >
              <ArrowUp className="size-5" />
            </Button>
          </div>
        </div>
      </form>
    );
  }

  // For learn mode, just return null since we're handling the input in the LearnChat component directly
  return null;
}
