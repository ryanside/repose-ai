"use client";

import { Message } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { memo } from "react";

export default memo(ExploreMessages);

function ExploreMessages({
  messages,
  lastMessageRef,
  handleSuggestionClick,
}: {
  messages: Message[];
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
  handleSuggestionClick: (content: string, fromSuggestionId: string) => void;
}) {
  return (
    <div className="w-full max-w-3xl h-full mx-auto tracking-wide space-y-4 p-3 sm:p-4 pb-[140px] sm:pb-[180px]">
      {messages.map((message, index) => (
        <div
          key={message.id}
          ref={index === messages.length - 1 ? lastMessageRef : undefined}
          className={`${
            index === messages.length - 1 ? "min-h-[calc(100vh)]" : ""
          }`}
          style={{ viewTransitionName: `message-${message.id}` }}
        >
          <div className="whitespace-pre-wrap w-full">
            <div className="font-medium mb-1">
              {message.role === "user" ? "You:" : "AI:"}
            </div>
            {message.parts
              ?.filter((part) => part.type !== "source")
              .map((part, index) => {
                if (part.type === "text") {
                  return (
                    <div key={index} className="text-sm sm:text-base">
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {part.text}
                      </Markdown>
                    </div>
                  );
                }
              })}
            {message.parts
              ?.filter((part) => part.type === "source")
              .map((part) => (
                <span
                  key={`source-${part.source.id}`}
                  className="text-xs sm:text-sm"
                >
                  <a
                    href={part.source.url}
                    target="_blank"
                    className="text-primary hover:underline"
                  >
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
                    <div className="my-3 sm:my-4 flex flex-wrap gap-2">
                      {suggestionsData.map((suggestion) => (
                        <Button
                          key={suggestion.id}
                          variant="outline"
                          className="text-xs sm:text-sm max-w-full h-auto py-2 whitespace-normal text-pretty cursor-pointer dark:hover:text-accent"
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
