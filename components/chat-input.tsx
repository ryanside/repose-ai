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
import { ArrowUp } from "lucide-react";
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
}: {
  onboarding: boolean;
  submitUserMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    placeholderPrompts[0]
  );
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    let fadeTimeoutId: NodeJS.Timeout | undefined;

    if (onboarding) {
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
  }, [onboarding]);

  useEffect(() => {
    if (onboarding && !isFading) {
      setCurrentPlaceholder(placeholderPrompts[placeholderIndex]);
    }
  }, [placeholderIndex, onboarding, isFading]);

  if (onboarding) {
    return (
      <div className="flex flex-col flex-1 max-w-7xl w-full gap-8 items-center mx-auto mt-4 pt-12 px-4 xs:pl-8 xs:pr-14 md:pt-[25vh] lg:mt-6 2xl:pr-20 max-sm:!px-1">
        <div className="flex w-full flex-col items-start mx-auto gap-3 max-md:pt-4 max-w-2xl pl-3 mb-4">
          <h1 className="text-5xl font-medium tracking-tight bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
            Hello,
          </h1>
          <p className="text-4xl font-medium tracking-tight">
            What do you want to explore?
          </p>
        </div>
        <div className="w-full max-w-2xl px-2">
          <p className="text-sm text-muted-foreground mb-4 pl-1">
            Explore topics using search grounded AI models and visualizations
          </p>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitUserMessage(
                        e as unknown as React.FormEvent<HTMLFormElement>
                      );
                    }
                  }}
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
                    <SelectItem value="gemini-2.5-pro" disabled>
                      gemini 2.5 pro (coming soon)
                    </SelectItem>
                    <SelectItem value="openai-models" disabled>
                      openai models (coming soon)
                    </SelectItem>
                    <SelectItem value="grok-models" disabled>
                      grok models (coming soon)
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
        </div>
      </div>
    );
  }

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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitUserMessage(
                  e as unknown as React.FormEvent<HTMLFormElement>
                );
              }
            }}
            className="min-h-[100px] resize-none rounded-2xl px-3 sm:px-4 py-3 shadow-sm font-medium tracking-wide"
          />
        </div>
        <div className="absolute bottom-0 w-full flex justify-between items-center px-3 sm:px-4 pb-3">
          <Select>
            <SelectTrigger className="w-[150px] sm:w-[180px]">
              <SelectValue placeholder="gemini 2.0 flash" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2">
              <SelectItem value="gemini-2.0-flash">gemini 2.0 flash</SelectItem>
              <SelectItem value="gemini-2.5-pro" disabled>
                gemini 2.5 pro (coming soon)
              </SelectItem>
              <SelectItem value="openai-models" disabled>
                openai models (coming soon)
              </SelectItem>
              <SelectItem value="grok-models" disabled>
                grok models (coming soon)
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
  );
}
