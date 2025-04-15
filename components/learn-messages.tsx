"use client";

import { Message } from "@ai-sdk/react";
import { memo } from "react";
import { ExternalLink, Link } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseCodeBlocksFromMessage } from "@/app/(chat)/parse-code-blocks";
import CodeSandbox from "@/app/(chat)/code-sandbox";
import YouTubeShorts from "@/app/(chat)/youtube-shorts";

export default memo(LearnMessages);

function LearnMessages({
  messages,
  lastMessageRef,
}: {
  messages: Message[];
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="w-full max-w-3xl h-full mx-auto tracking-wide space-y-8 p-3 sm:p-4 pb-32">
      {messages.map((message, index) => {
        // Parse message content for code blocks
        let messageContent = "";
        let codeBlocks: Array<{
          language: string;
          code: string;
          expectedOutput: string;
        }> = [];

        if (message.parts && message.parts.length > 0) {
          const textParts = message.parts.filter(
            (part) => part.type === "text"
          );
          if (textParts.length > 0 && textParts[0].type === "text") {
            const { codeBlocks: extractedBlocks, cleanedMessage } =
              parseCodeBlocksFromMessage(textParts[0].text);
            messageContent = cleanedMessage;
            codeBlocks = extractedBlocks;
          }
        }

        return (
          <div
            key={message.id}
            ref={index === messages.length - 1 ? lastMessageRef : undefined}
            className={`bg-card p-4 sm:p-6 rounded-xl border shadow-sm ${
              index === messages.length - 1 ? "min-h-[calc(100vh-280px)]" : ""
            }`}
          >
            <div className="whitespace-pre-wrap w-full">
              <div className="font-medium mb-2 text-lg border-b pb-2">
                {message.role === "user" ? (
                  <span className="text-accent">Question:</span>
                ) : (
                  <span className="text-primary">
                    Lesson {index / 2 + 0.5}:
                  </span>
                )}
              </div>

              {/* Text Content */}
              <div className="prose prose-sm sm:prose-base prose-p:my-2 prose-pre:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-headings:my-3 dark:prose-invert">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {message.role === "user" ? message.content : messageContent}
                </Markdown>
              </div>

              {/* Code Blocks */}
              {message.role === "assistant" &&
                codeBlocks.map((codeBlock, idx) => (
                  <CodeSandbox
                    key={`${message.id}-code-${idx}`}
                    code={codeBlock.code}
                    language={codeBlock.language}
                    expectedOutput={codeBlock.expectedOutput}
                  />
                ))}

              {/* Add YouTube Short for assistant messages */}
              {message.role === "assistant" &&
                messages.length > 0 &&
                index > 0 && (
                  <div className="mt-8 mb-12">
                    <YouTubeShorts topicQuery={messages[0].content} />
                  </div>
                )}

              {/* Sources Section */}
              {message.parts?.some((part) => part.type === "source") && (
                <div className="mb-4 mt-6">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Link size={16} />
                    <span>Sources</span>
                    <span className="text-muted-foreground bg-muted rounded-md px-1">
                      {
                        message.parts.filter((part) => part.type === "source")
                          .length
                      }
                    </span>
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
                          className="flex-shrink-0 border rounded-md p-2 min-w-[200px] max-w-[280px] bg-background hover:bg-muted transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="text-xs font-medium text-primary truncate max-w-[85%] group flex items-center gap-1">
                              <span className="truncate">
                                {part.source.title ??
                                  new URL(part.source.url).hostname}
                              </span>
                              <ExternalLink
                                size={12}
                                className="flex-shrink-0 opacity-70"
                              />
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
