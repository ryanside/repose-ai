"use client";

import { Message } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ExploreMessages({
  messages,
  lastMessageRef,
  handleSuggestionClick,
}: {
  messages: Message[];
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
  handleSuggestionClick: (content: string, fromSuggestionId: string) => void;
}) {
  return (
    <div className="w-3xl h-full mx-auto tracking-wide space-y-4 pb-[180px]">
      {messages.map((message, index) => (
        <div
          key={message.id}
          ref={index === messages.length - 1 ? lastMessageRef : undefined}
          className={`${
            index === messages.length - 1 ? "min-h-[calc(100vh)] relative" : ""
          }`}
        >
          <div className="whitespace-pre-wrap w-full">
            {message.role === "user" ? "User: " : "AI: "}
            {message.parts?.
              filter((part) => part.type !== "source")
              .map((part, index) => {
                if (part.type === "text") {
                  return (
                    <div key={index} className="">
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {part.text}
                      </Markdown>
                    </div>
                  );
                }
              })}
            {message.parts?.
              filter((part) => part.type === "source")
              .map((part) => (
                <span key={`source-${part.source.id}`}>
                  <a href={part.source.url} target="_blank">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {part.source.title ?? new URL(part.source.url).hostname}
                    </Markdown>
                  </a>
                </span>
              ))}
            <div key={message.id}>
              {(() => {
                const suggestionsAnnotation = message.annotations?.find(
                  (annotation) =>
                    typeof annotation === "object" &&
                    annotation !== null &&
                    "suggestions" in annotation &&
                    typeof annotation.suggestions === "object" &&
                    annotation.suggestions !== null &&
                    "suggestions" in annotation.suggestions &&
                    Array.isArray(annotation.suggestions.suggestions)
                );

                if (suggestionsAnnotation) {
                  const suggestionsData = (
                    suggestionsAnnotation as {
                      suggestions: {
                        suggestions: {
                          id: string;
                          content: string;
                        }[];
                      };
                    }
                  ).suggestions.suggestions as Array<{
                    id: string;
                    content: string;
                  }>;

                  return (
                    <div className="my-4 flex flex-wrap gap-2">
                      {suggestionsData.map((suggestion) => (
                        <Button
                          key={suggestion.id}
                          variant="outline"
                          className="w-3xl h-auto whitespace-normal text-pretty cursor-pointer dark:hover:text-accent"
                          onClick={() => {
                            // Disable the button when clicked
                            const button = document.getElementById(
                              suggestion.id
                            ) as HTMLButtonElement;
                            if (button) button.disabled = true;

                            handleSuggestionClick(
                              suggestion.content,
                              suggestion.id
                            );
                          }}
                          id={suggestion.id}
                        >
                          {suggestion.content}
                        </Button>
                      ))}
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
