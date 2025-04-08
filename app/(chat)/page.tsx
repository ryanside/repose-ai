"use client";

import { useChat, Message } from "@ai-sdk/react";
import { useState } from "react";
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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("");
  const [branches, setBranches] = useState<string[]>([]);

  const { messages, input, handleInputChange, append, status } = useChat({
    api: "/api/explore",
    onFinish: (message) => {
      handleGeneration(message, topic);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTopic(input);
    append({ role: "user", content: input });
  };

  const handleGeneration = async (message: Message, topic: string) => {
    console.log(message);
    if (message.parts?.[0]?.type === "text") {
      setIsGenerating(true);
      const { data, error } = await tryCatch(
        generateBranches({
          messageContent: message.parts[0].text,
        })
      );

      if (error) {
        console.error("Error generating branches:", error);
        setIsGenerating(false);
        return;
      }

      setBranches(data.result.branches);
      setIsGenerating(false);
    }
  };

  const handleNextInput = (branch: string) => {
    setTopic(branch);
    setIsGenerating(true);
    append({ role: "user", content: branch });
  };

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
        <div className="w-3xl mx-auto space-y-12 px-4 my-4">
          <div className="p-4 rounded-2xl bg-accent/30 border border-accent/20 space-y-2 ml-48">
            <h1 className="tracking-tight font-medium">Exploring</h1>
            <p className="tracking-tight text-muted-foreground">{topic}</p>
          </div>

          {status === "submitted" ? (
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[180px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ) : (
            messages
              .filter((message) => message.role === "assistant")
              .map((message) => (
                <div key={message.id}>
                  AI:{" "}
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
                          {part.source.title ??
                            new URL(part.source.url).hostname}
                        </a>
                        ]
                      </span>
                    ))}
                </div>
              ))
          )}
          {/* Generated Branches */}
          {isGenerating ? (
            <div className="flex flex-col space-y-3">
              {[1, 2, 3].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              {branches.map((branch, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="cursor-pointer whitespace-normal text-left h-auto transition-none"
                  onClick={() => handleNextInput(branch)}
                >
                  {branch}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
