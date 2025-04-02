"use client";

import { useChat, Message } from "@ai-sdk/react";
import { useState } from "react";
import { generateBranches } from "./actions";

export default function Chat() {
  const [generatedBranches, setGeneratedBranches] = useState<string[] | null>(
    null
  );

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/explore",
    onFinish: (message) => {
      handleGeneration(message);
    },
  });

  const handleGeneration = async (message: Message) => {
    console.log("starting handleGeneration");
    console.log(message);

    if (message.parts?.[0]?.type === "text") {
      const { result } = await generateBranches({
        messageContent: message.parts[0].text,
      });
      if (Array.isArray(result.branches)) {
        setGeneratedBranches(result.branches);
      } else {
        console.error("Invalid response format from generateBranches");
      }
      console.log(result.branches);
    } else {
      console.error("First part of the message is not text.");
    }

    console.log("finished handleGeneration");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <header className="py-6 px-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-center text-zinc-800 dark:text-zinc-100">
          proof of concept v2 4/2/2025
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6 pb-24">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500 dark:text-zinc-400">
                Start a conversation by typing a message below.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none"
                  }`}
                >
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
                      // Handle other part types if necessary
                      return null;
                    })}

                  {message.parts.filter((part) => part.type === "source")
                    .length > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-300/30 dark:border-zinc-700/30 text-sm">
                      <p className="font-medium mb-1">Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.parts
                          .filter((part) => part.type === "source")
                          .map((part) => {
                            // Add type check for source part
                            if (part.type === "source") {
                              return (
                                <a
                                  key={`source-${part.source.id}`}
                                  href={part.source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                    message.role === "user"
                                      ? "bg-blue-700 hover:bg-blue-800"
                                      : "bg-zinc-300 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                                  }`}
                                >
                                  {part.source.title ??
                                    new URL(part.source.url).hostname}
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
            ))
          )}
          {/* Generated Content Display */}
          <div className="max-w-3xl mx-auto mb-4 space-y-4">
            {generatedBranches && (
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-400 dark:border-purple-600 rounded-md">
                <h3 className="font-semibold mb-1 text-purple-800 dark:text-purple-200">
                  Generated Branches:
                </h3>
                <ul className="list-disc list-inside text-purple-700 dark:text-purple-300">
                  {generatedBranches.map((branch, index) => (
                    <li key={index}>{branch}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-4">
          <div className="relative">
            <input
              className="w-full p-4 pr-12 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full shadow-sm placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={input}
              placeholder="Type your message..."
              onChange={handleInputChange}
            />
            <button
              type="submit"
              disabled={!input.trim()} // Disable submit if input is empty
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
