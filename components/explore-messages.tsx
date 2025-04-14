"use client";

import { Message } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { memo } from "react";
import { ExternalLink, Link } from "lucide-react";

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
            index === messages.length - 1 ? "min-h-[calc(100vh)]  pb-[120px]" : ""
          }`}
        >
          <div className="whitespace-pre-wrap w-full">
            <div className="font-medium mb-1">
              {message.role === "user" ? <span className="text-accent">You:</span> : <span className="text-primary">AI:</span>}
            </div>
            
            {/* Text Content */}
            {message.parts
              ?.filter((part) => part.type !== "source")
              .map((part, index) => {
                if (part.type === "text") {
                  return (
                    <div key={index} className="prose prose-sm sm:prose-base prose-p:my-1 prose-pre:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1 dark:prose-invert">
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {part.text}
                      </Markdown>
                    </div>
                  );
                }
              })}
            
            {/* Sources Section */}
            {message.parts?.some(part => part.type === "source") && (
              <div className="mb-4 mt-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Link size={16} />
                  <span>Sources</span>
                  <span className="text-muted-foreground bg-muted rounded-md px-1">{message.parts.filter((part) => part.type ==="source").length}</span>
                </div>
                <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-thin">
                  {message.parts
                    ?.filter((part) => part.type === "source")
                    .map((part) => (
                      <a 
                        key={`source-${part.source.id}`}
                        href={part.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 border rounded-md p-2 min-w-[200px] max-w-[280px] bg-card hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-xs font-medium text-primary truncate max-w-[85%] group flex items-center gap-1">
                            <span className="truncate">{part.source.title ?? new URL(part.source.url).hostname}</span>
                            <ExternalLink size={12} className="flex-shrink-0 opacity-70" />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {new URL(part.source.url).hostname}
                        </div>
                      </a>
                    ))}
                </div>
              </div>
            )}

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
                          className="text-xs sm:text-sm w-full h-auto py-2 whitespace-normal text-pretty cursor-pointer dark:hover:text-accent"
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
