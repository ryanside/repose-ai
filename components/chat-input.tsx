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
}: {
  onboarding: boolean;
  submitUserMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  if (onboarding) {
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
                  placeholder="Enter your topic..."
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
            className="min-h-[80px] sm:min-h-[100px] resize-none rounded-2xl px-3 sm:px-4 py-3 shadow-sm font-medium tracking-wide"
          />
        </div>
        <div className="absolute bottom-0 w-full flex justify-between items-center px-3 sm:px-4 pb-3">
          <Select>
            <SelectTrigger className="w-[100px] sm:w-[180px]">
              <SelectValue placeholder="gemini 2.0 flash" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2">
              <SelectItem value="gemini-2.0-flash">gemini 2.0 flash</SelectItem>
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
