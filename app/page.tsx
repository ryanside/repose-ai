"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import { exploreResponseSchema } from "./api/chat/use-object/schema";
import type { z } from "zod";

type ExploreResponse = z.infer<typeof exploreResponseSchema>;

export default function Chat() {
  const [topic, setTopic] = useState<string>("");
  const [inputComplete, setInputComplete] = useState<boolean>(false);
  const { object, submit, isLoading } = useObject<ExploreResponse>({
    api: "/api/chat",
    schema: exploreResponseSchema,
  });

  const fetchFirstConcept = async () => {
    const explorePrompt = `${topic}`;
    submit({
      messages: [
        {
          role: "user",
          content: explorePrompt
        }
      ]
    });
  };

  const fetchNextConcept = async (title: string) => {
    const explorePrompt = `${title}`;
    submit({
      messages: [
        {
          role: "user",
          content: explorePrompt
        }
      ]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setInputComplete(true);
    fetchFirstConcept();
  };

  return (
    <div className="flex flex-col w-full min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center w-full mx-auto space-y-4">
        <h1 className="text-3xl font-semibold tracking-tighter text-foreground">
          concept explorer
        </h1>
        <p className="text-sm text-pretty text-foreground/50">
          explore topics with AI-powered search and structured learning paths
        </p>
      </div>
      
      <div className="flex flex-col w-full max-w-3xl mx-auto space-y-6 p-4 pb-8 bg-foreground/5 text-foreground rounded-lg overflow-y-auto max-h-[800px] my-4">
        {inputComplete && (
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            exploring: {topic}
          </h2>
        )}
        
        {isLoading && !object && (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-foreground/10 rounded w-3/4"></div>
            <div className="h-4 bg-foreground/10 rounded w-1/2"></div>
          </div>
        )}

        {object && (
          <div className="space-y-6">
            {/* Main Content */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tighter text-foreground">
                {object.title}
              </h3>
              <p className="text-pretty tracking-wide text-foreground/90">
                {object.content}
              </p>
            </div>

            {/* Sources */}
            {object.sources && object.sources.length > 0 && (
              <div className="space-y-2 border-t border-foreground/10 pt-4">
                <h4 className="text-sm font-semibold text-foreground/70">Sources</h4>
                <div className="space-y-2">
                  {object.sources.map((source, index) => (
                    <div key={index} className="text-sm space-y-1">
                      {source && (
                        <>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline block"
                          >
                            {source.title}
                          </a>
                          {source.snippet && (
                            <p className="text-foreground/60 text-xs">
                              {source.snippet}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discussion Options */}
            {object.discussionOptions && object.discussionOptions.length > 0 && (
              <div className="space-y-3 border-t border-foreground/10 pt-4">
                <h4 className="text-sm font-semibold text-foreground/70">
                  Explore Further
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {object.discussionOptions.map((option, index) => (
                    option && (
                      <button
                        key={index}
                        onClick={() => option.title && fetchNextConcept(option.title)}
                        className="text-left p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <p className="font-medium text-foreground">
                          {option.title}
                        </p>
                        {option.description && (
                          <p className="text-sm text-foreground/60 mt-1">
                            {option.description}
                          </p>
                        )}
                      </button>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {object.metadata && (
              <div className="text-xs text-foreground/50 border-t border-foreground/10 pt-4">
                {object.metadata.lastUpdated && (
                  <p>Last updated: {object.metadata.lastUpdated}</p>
                )}
                {object.metadata.confidence && (
                  <p>Source confidence: {Math.round(object.metadata.confidence * 100)}%</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!inputComplete ? (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
          <input
            className="bg-background w-full p-2 mt-auto border border-foreground/10 rounded-lg shadow"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic to explore..."
          />
        </form>
      ) : null}
    </div>
  );
}
