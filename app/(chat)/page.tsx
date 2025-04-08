"use client";

import { useChat, Message } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { generateBranches } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { tryCatch } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Chat() {
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, append } = useChat({
    api: "/api/explore",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    append({ role: "user", content: input });
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0) {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col min-h-full w-full overflow-x-hidden">
      {messages.length === 0 ? (
        <div className="flex flex-col flex-1 max-w-7xl w-full gap-8 items-center mx-auto mt-4 pt-12 px-4 xs:pl-8 xs:pr-14 md:pt-[25vh] lg:mt-6 2xl:pr-20 max-sm:!px-1">
          <div className="mx-auto flex w-full flex-col items-center gap-7 max-md:pt-4 max-w-2xl">
            <h1 className="text-4xl font-medium tracking-tight font-serif">
              🌌 lets <span className="text-primary">explore</span> it
            </h1>
          </div>
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSubmit}>
              <div className="relative flex flex-col w-full gap-4 ">
                <div className="flex flex-col">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Enter your topic..."
                    rows={4}
                    className="min-h-[150px] resize-none rounded-3xl px-4 py-3 shadow-sm font-medium tracking-wide"
                  />
                </div>
                <div className="absolute bottom-0 w-full flex justify-between items-center px-4 pb-3">
                  <Select>
                    <SelectTrigger className="w-[180px]">
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
                    className="rounded-lg bg-primary hover:bg-primary/90"
                  >
                    <ArrowUp className="size-5" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="w-3xl mx-auto space-y-12 px-4 my-4 mb-[120px]">
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              ref={index === messages.length - 1 ? lastMessageRef : undefined}
              className={`${
                index === messages.length - 1 
                  ? "min-h-[calc(100vh-200px)] relative" 
                  : ""
              }`}
            >
              <div className={`${
                message.role === "assistant" && index === messages.length - 1
                  ? "absolute top-0 left-0 right-0"
                  : ""
              }`}>
                {message.role === "user" ? "User: " : "AI: "}
                {message.parts
                  .filter((part) => part.type !== "source")
                  .map((part, index) => {
                    if (part.type === "text") {
                      return <div key={index}>{part.text}</div>;
                    }
                  })}
                {message.parts
                  .filter((part) => part.type === "source")
                  .map((part) => (
                    <span key={`source-${part.source.id}`}>
                      [
                      <a href={part.source.url} target="_blank">
                        {part.source.title ?? new URL(part.source.url).hostname}
                      </a>
                      ]
                    </span>
                  ))}
              </div>
            </div>
          ))}
          <form
            onSubmit={handleSubmit}
            className="fixed bottom-8 left-1/2 rounded-3xl -translate-x-1/2 w-full max-w-3xl backdrop-blur-sm"
          >
            <div className="relative flex flex-col w-full gap-4 ">
              <div className="flex flex-col">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Enter your topic..."
                  rows={4}
                  className="min-h-[75px] resize-none rounded-3xl px-4 py-3 shadow-sm font-medium tracking-wide"
                />
              </div>
              <div className="absolute bottom-0 w-full flex justify-between items-center px-4 pb-3">
                <Select>
                  <SelectTrigger className="w-[180px]">
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
                  className="rounded-lg bg-primary hover:bg-primary/90"
                >
                  <ArrowUp className="size-5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
