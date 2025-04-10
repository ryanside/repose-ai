"use client";

import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
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
import { generateUUID } from "@/lib/utils";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function Chat() {
  const id = generateUUID();
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, append, setInput } =
    useChat({
      generateId: generateUUID,
      sendExtraMessageFields: true,
      api: "/api/explore",
      onFinish: (message) => {
        messageToNodes(message);
      },
    });

  const messageToNodes = (message: Message) => {};

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const submitUserMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleSuggestionClick = (content: string, fromSuggestionId: string) => {
    append(
      {
        role: "user",
        content: content,
      },
      {
        body: {
          fromSuggestionId,
        },
      }
    );
    setInput(""); // Clear the main input field
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // useEffect(() => {
  //   if (messages.length > 0) {
  //     lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

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
            <form onSubmit={submitUserMessage}>
              <div className="relative flex flex-col w-full gap-4 ">
                <div className="flex flex-col">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Enter your topic..."
                    className="min-h-[150px] resize-none rounded-3xl px-4 py-3 shadow-sm font-medium tracking-wide"
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
                    className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                  >
                    <ArrowUp className="size-5" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-row ">
          <div className="flex-1 max-w-3xl mr-auto space-y-12 px-4 my-4 mb-[120px]">
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
                <div
                  className={`${
                    message.role === "assistant" &&
                    index === messages.length - 1
                      ? "absolute top-0 left-0 right-0"
                      : ""
                  }`}
                >
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
                          {part.source.title ??
                            new URL(part.source.url).hostname}
                        </a>
                        ]
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
                        const suggestionsData = (suggestionsAnnotation as any)
                          .suggestions.suggestions as Array<{
                          id: string;
                          content: string;
                        }>;

                        return (
                          <div className="my-4 flex flex-wrap gap-2">
                            {suggestionsData.map((suggestion) => (
                              <Button
                                key={suggestion.id}
                                variant="outline"
                                className="max-w-3xl h-auto whitespace-normal text-left cursor-pointer"
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
            <form
              onSubmit={submitUserMessage}
              className="fixed bottom-8 left-1/2 rounded-3xl -translate-x-1/2 w-full max-w-3xl bg-background/30 backdrop-blur-sm z-50"
            >
              <div className="relative flex flex-col w-full gap-4 ">
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
                    className="min-h-[100px] resize-none rounded-3xl px-4 py-3 shadow-sm font-medium tracking-wide"
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
                    className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                  >
                    <ArrowUp className="size-5" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
          <div className="flex-1 h-full absolute right-0 top-0 w-1/2 rounded-r-lg bg-background overflow-hidden border-l">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
            >
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  );
}
