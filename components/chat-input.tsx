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
import { memo } from "react";

export default memo(ChatInput);

function ChatInput({
  onboarding = false,
  submitUserMessage,
  input,
  handleInputChange,
  mode = "explore",
}: {
  onboarding: boolean;
  submitUserMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  mode?: "explore" | "learn";
}) {
  if (onboarding) {
    // Explore mode onboarding
    if (mode === "explore") {
      return (
        <div className="flex flex-col flex-1 max-w-7xl w-full gap-8 items-center mx-auto mt-4 pt-12 px-4 xs:pl-8 xs:pr-14 md:pt-[25vh] lg:mt-6 2xl:pr-20 max-sm:!px-1">
          <div className="flex w-full flex-col items-center mx-auto gap-7 max-md:pt-4 max-w-2xl">
            <h1 className="text-4xl font-medium tracking-tight">
              🌌 lets{" "}
              <span className="text-primary dark:text-accent">explore</span> it
            </h1>
          </div>
          <div className="w-full max-w-2xl px-2">
            <form onSubmit={submitUserMessage}>
              <div className="relative flex flex-col w-full gap-4">
                <div className="flex flex-col">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Enter your topic to explore..."
                    className="min-h-[120px] sm:min-h-[150px] resize-none rounded-2xl px-4 py-3 shadow-sm font-medium tracking-wide"
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
          </div>
        </div>
      );
    }

    // Learn mode onboarding
    return (
      <div className="flex flex-col flex-1 max-w-7xl w-full gap-8 items-center mx-auto mt-4 pt-12 px-4 xs:pl-8 xs:pr-14 md:pt-[25vh] lg:mt-6 2xl:pr-20 max-sm:!px-1">
        <div className="flex w-full flex-col items-center mx-auto gap-7 max-md:pt-4 max-w-2xl">
          <h1 className="text-4xl font-medium tracking-tight">
            📚 lets <span className="text-primary dark:text-accent">learn</span>{" "}
            it
          </h1>
          <p className="text-center text-muted-foreground">
            Enter any topic below to start your personalized learning journey
          </p>
        </div>
        <div className="w-full max-w-2xl px-2">
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
        </div>
      </div>
    );
  }

  // For explore mode, show the full input with model selection
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

  // For learn mode, just return a simple invisible component
  // since we're handling the input in the LearnChat component directly
  return null;
}
