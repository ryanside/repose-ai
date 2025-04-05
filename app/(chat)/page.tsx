"use client";

import { useChat, Message } from "@ai-sdk/react";
import { useState } from "react";
import { generateBranches } from "./actions";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
import { tryCatch } from "@/lib/try-catch";


export default function Chat() {
  const [submitted, setSubmitted] = useState(false);
  const [generatedBranches, setGeneratedBranches] = useState<string[]>([]);

  const { messages, input, handleInputChange, append } = useChat({
    api: "/api/explore",
    onFinish: (message) => {
      handleGeneration(message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    append({ role: "user", content: input });
  };

  const handleGeneration = async (message: Message) => {

    if (message.parts?.[0]?.type === "text") {
      const { data, error } = await tryCatch(
        generateBranches({
          messageContent: message.parts[0].text,
        })
      );

      if (error) {
        console.error("Error generating branches:", error);
        return;
      }
      setGeneratedBranches(data.result.branches);
    }
  };

  return (
    <div className="flex flex-col min-h-full w-full overflow-x-hidden">
      <SidebarTrigger className="absolute top-4 left-2 md:hidden" />
      {!submitted ? (
        <div className="flex flex-col flex-1 max-w-7xl w-full gap-8 items-center mx-auto mt-4 pt-12 px-4 xs:pl-8 xs:pr-14 md:pt-[25vh] lg:mt-6 2xl:pr-20 max-sm:!px-1">
          <div className="mx-auto flex w-full flex-col items-center gap-7 max-md:pt-4 max-w-2xl">
            <h1 className="text-4xl font-bold text-center font-lora">
              lets explore it
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
                    className="min-h-[120px] resize-none rounded-2xl px-4 py-3 shadow-sm"
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
        <div className="max-w-3xl mx-auto space-y-6 pb-24 px-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <span>AI Assistant</span>
                </div>
              )}
              <div className="prose dark:prose-invert max-w-none">
                {message.parts
                  .filter((part) => part.type !== "source")
                  .map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <div key={index} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      );
                    }
                    return null;
                  })}

                {message.parts.filter((part) => part.type === "source").length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="font-medium mb-2">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {message.parts
                        .filter((part) => part.type === "source")
                        .map((part) => {
                          if (part.type === "source") {
                            return (
                              <a
                                key={`source-${part.source.id}`}
                                href={part.source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {part.source.title ?? new URL(part.source.url).hostname}
                              </a>
                            );
                          }
                          return null;
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Generated Branches */}
          {generatedBranches && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent backdrop-blur-sm border-t border-border">
              <div className="max-w-3xl mx-auto flex flex-wrap gap-2 justify-center">
                {generatedBranches.map((branch, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                  >
                    {branch}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
