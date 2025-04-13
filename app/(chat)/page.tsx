"use client";

import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp, LayoutPanelLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { generateUUID } from "@/lib/utils";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Dagre from "@dagrejs/dagre";
import Markdown from "react-markdown";

const getLayoutedElements = (
  nodes: CustomNode[],
  edges: CustomEdge[],
  options: { direction: string }
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  // Set graph settings
  g.setGraph({
    rankdir: options.direction,
  });

  // Add nodes and edges to the graph
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 200,
      height: node.measured?.height ?? 180,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

type CustomNode = Node<{ label: string }>;
type CustomEdge = Edge;

export default function Chat() {
  const [id, setId] = useState<string | undefined>(undefined);
  const [mobileView, setMobileView] = useState<"chat" | "flow">("chat");
  useEffect(() => {
    setId(generateUUID());
  }, []);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    setInput,
  } = useChat({
    id,
    generateId: generateUUID,
    sendExtraMessageFields: true,
    api: "/api/explore",
    onFinish: (message) => {
      messageToNodes(message);
    },
  });

  const messageToNodes = (message: Message) => {
    console.log("starting messageToNodes");
    // check if the message has suggestions
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
    const suggestionsData = (
      suggestionsAnnotation as {
        suggestions: { suggestions: { id: string; content: string }[] };
      }
    ).suggestions.suggestions as Array<{
      id: string;
      content: string;
    }>;

    // if the message has a suggestion id, create fromSuggestionId
    const fromSuggestionIdAnnotation = message.annotations?.find(
      (annotation) =>
        typeof annotation === "object" &&
        annotation !== null &&
        "fromSuggestionId" in annotation &&
        typeof annotation.fromSuggestionId === "string"
    );
    console.log("fromSuggestionIdAnnotation", fromSuggestionIdAnnotation);
    const fromSuggestionId = fromSuggestionIdAnnotation
      ? (fromSuggestionIdAnnotation as { fromSuggestionId: string })
          .fromSuggestionId
      : undefined;

    // create root and suggestions nodes
    const rootNode = {
      id: message.id,
      data: { label: message.content.substring(0, 50) + "..." },
      position: { x: 0, y: 0 },
    };
    const suggestionNodes = suggestionsData.map((suggestion) => {
      return {
        id: suggestion.id,
        data: { label: suggestion.content },
        position: { x: 0, y: 0 },
      };
    });

    // Create edges connecting the root node to each suggestion
    const suggestionEdges = suggestionNodes.map((suggestionNode) => ({
      id: `${rootNode.id}-${suggestionNode.id}`,
      source: rootNode.id,
      target: suggestionNode.id,
    }));

    // if the message has a suggestion id, create a edge from the suggestion to the message
    if (fromSuggestionId) {
      suggestionEdges.push({
        id: `${fromSuggestionId}-${message.id}`,
        source: fromSuggestionId,
        target: message.id,
      });
    }

    // Combine all nodes and edges
    const newNodes = [rootNode, ...suggestionNodes];
    const newEdges = [...suggestionEdges];
    console.log("newNodes", newNodes);
    console.log("newEdges", newEdges);

    const layoutedElements = getLayoutedElements(newNodes, newEdges, {
      direction: "TB",
    });

    // Update both nodes and edges
    setNodes((nodes) => [...nodes, ...layoutedElements.nodes]);
    setEdges((edges) => [...edges, ...layoutedElements.edges]);
  };

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

  const toggleView = () => {
    setMobileView(mobileView === "chat" ? "flow" : "chat");
  };

  // useEffect(() => {
  //   if (messages.length > 0) {
  //     lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex flex-col flex-1 max-w-7xl w-full gap-8 items-center mx-auto mt-4 pt-12 px-4 xs:pl-8 xs:pr-14 md:pt-[25vh] lg:mt-6 2xl:pr-20 max-sm:!px-1">
          <div className="flex w-full flex-col items-center mx-auto gap-7 max-md:pt-4 max-w-2xl">
            <h1 className="text-4xl font-medium tracking-tight">
              🌌 lets{" "}
              <span className="text-primary dark:text-accent">explore</span> it
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
                    className="min-h-[150px] resize-none rounded-2xl px-4 py-3 shadow-sm font-medium tracking-wide"
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
        <>
          {/* Chat.tsx component */}
          {/* header */}
          <header className="flex h-12 shrink-0 items-center gap-2 border-b justify-between">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4 bg-red-200"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    Exploring:{" "}
                    <span className="tracking-tight font-semibold animate-pulse">
                      {messages[0].content}
                    </span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="pr-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleView}
                className="md:hidden flex"
                aria-label="Toggle view"
              >
                <LayoutPanelLeft
                  className={mobileView === "chat" ? "" : "text-primary"}
                />
              </Button>
            </div>
          </header>
          {/* main content */}
          <div className="flex flex-row flex-1 overflow-hidden">
            {/* chat view */}
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={50}>
                <div
                  className={`flex flex-col mx-auto h-full w-full overflow-y-auto relative  ${
                    mobileView === "chat" ? "block md:block" : "hidden md:block"
                  }`}
                >
                  <div className="w-3xl h-full mx-auto tracking-wide leading-relaxed pb-[180px]">
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        ref={
                          index === messages.length - 1
                            ? lastMessageRef
                            : undefined
                        }
                        className={`${
                          index === messages.length - 1
                            ? "min-h-[calc(100vh)] relative"
                            : ""
                        }`}
                      >
                        <div className="whitespace-normal w-full">
                          {message.role === "user" ? "User: " : "AI: "}
                          {message.parts
                            .filter((part) => part.type !== "source")
                            .map((part, index) => {
                              if (part.type === "text") {
                                return (
                                  <div
                                    key={index}
                                    className="whitespace-pre-wrap"
                                  >
                                    <Markdown>{part.text}</Markdown>
                                  </div>
                                );
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
                              const suggestionsAnnotation =
                                message.annotations?.find(
                                  (annotation) =>
                                    typeof annotation === "object" &&
                                    annotation !== null &&
                                    "suggestions" in annotation &&
                                    typeof annotation.suggestions ===
                                      "object" &&
                                    annotation.suggestions !== null &&
                                    "suggestions" in annotation.suggestions &&
                                    Array.isArray(
                                      annotation.suggestions.suggestions
                                    )
                                );

                              if (suggestionsAnnotation) {
                                const suggestionsData = (
                                  suggestionsAnnotation as {
                                    suggestions: {
                                      suggestions: { id: string; content: string }[];
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
                                          const button =
                                            document.getElementById(
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
                  <form
                    onSubmit={submitUserMessage}
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-2xl w-full max-w-xl lg:max-w-3xl bg-background/30 backdrop-blur-sm z-50"
                  >
                    <div className="relative flex flex-col gap-4 ">
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
                          className="min-h-[100px] resize-none rounded-2xl px-4 py-3 shadow-sm font-medium tracking-wide"
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
                          className="rounded-lg  bg-primary hover:bg-primary/90 cursor-pointer"
                        >
                          <ArrowUp className="size-5" />
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              {/* flow view */}
              <ResizablePanel defaultSize={50}>
                <div
                  className={`h-full bg-gradient-to-br from-background from-50% to-primary/30 md:rounded-br-xl overflow-hidden block w-full`}
                >
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                  >
                    <Background variant={BackgroundVariant.Dots} />
                  </ReactFlow>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </>
      )}
    </div>
  );
}
