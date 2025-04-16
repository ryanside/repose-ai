"use client";

import ExploreMessages from "./explore-messages";
import ChatHeader from "./chat-header";
import ChatInput from "./chat-input";
import { Message, useChat } from "@ai-sdk/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { generateUUID, getLayoutedElements } from "@/lib/utils";
import {
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ResizableHandle } from "./ui/resizable";
import { ResizablePanelGroup } from "./ui/resizable";
import { ResizablePanel } from "./ui/resizable";

export type CustomNode = Node<{ label: string }>;
export type CustomEdge = Edge;

export default function ExploreChat({
  id,
  initialMessages,
  initialNodes,
  initialEdges,
}: {
  id: string;
  initialMessages: Message[];
  initialNodes: CustomNode[];
  initialEdges: CustomEdge[];
}) {
  const [mobileView, setMobileView] = useState<"chat" | "flow">("chat");
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>(initialEdges);
  const { messages, input, handleInputChange, handleSubmit, append, setInput } =
    useChat({
      id,
      initialMessages,
      generateId: generateUUID,
      sendExtraMessageFields: true,
      api: "/api/explore",
      onFinish: (message) => {
        messageToNodes(message);
      },
    });

  const messageToNodes = useCallback(
    (message: Message) => {
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
        label: "suggestion",
        animated: true,
      }));

      // if the message has a suggestion id, create a edge from the suggestion to the message
      if (fromSuggestionId) {
        suggestionEdges.push({
          id: `${fromSuggestionId}-${message.id}`,
          source: fromSuggestionId,
          target: message.id,
          label: "branching...",
          animated: false,
        });
      }

      // Combine all nodes and edges
      const newNodes = [rootNode, ...suggestionNodes];
      const newEdges = [...suggestionEdges];

      const layoutedElements = getLayoutedElements(newNodes, newEdges, {
        direction: "TB",
      });

      // Update both nodes and edges
      setNodes((nodes) => [...nodes, ...layoutedElements.nodes]);
      setEdges((edges) => [...edges, ...layoutedElements.edges]);
    },
    [setEdges, setNodes]
  );

  const scrollToLastMessage = useCallback(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastMessageRef]);

  const submitUserMessage = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      window.history.replaceState({}, "", `/explore/${id}`);
      handleSubmit(e);
      setTimeout(scrollToLastMessage, 50);
    },
    [handleSubmit, scrollToLastMessage, id]
  );

  const handleSuggestionClick = useCallback(
    (content: string, fromSuggestionId: string) => {
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
      setTimeout(scrollToLastMessage, 50);
    },
    [append, scrollToLastMessage, setInput]
  );

  const toggleView = useCallback(() => {
    setMobileView((prev) => (prev === "chat" ? "flow" : "chat"));
  }, []);

  const firstMessageContent = useMemo(() => {
    return messages.length > 0 ? messages[0].content : "";
  }, [messages]);

  // useEffect(() => {
  //   if (messages.length > 0) {
  //     lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

  // if the messages is empty, show the onboarding chat input
  if (messages.length === 0) {
    return (
      <ChatInput
        onboarding={true}
        submitUserMessage={submitUserMessage}
        input={input}
        handleInputChange={handleInputChange}
      />
    );
  }

  // if the messages is not empty, show the chat
  return (
    <>
      <ChatHeader
        firstMessageContent={firstMessageContent}
        toggleView={toggleView}
        mobileView={mobileView}
      />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel
            defaultSize={50}
            className={`${
              mobileView === "chat" ? "flex" : "hidden md:flex"
            } flex-col w-full`}
          >
            <div className="flex flex-col mx-auto h-full w-full overflow-y-auto relative">
              <ExploreMessages
                messages={messages}
                lastMessageRef={lastMessageRef}
                handleSuggestionClick={handleSuggestionClick}
              />
              <ChatInput
                onboarding={false}
                submitUserMessage={submitUserMessage}
                input={input}
                handleInputChange={handleInputChange}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="hidden md:flex" />
          {/* flow view */}
          <ResizablePanel
            defaultSize={50}
            className={`${
              mobileView === "flow" ? "flex" : "hidden md:flex"
            } flex-col w-full`}
          >
            <div className="h-full bg-gradient-to-br from-background from-50% to-primary/30 md:rounded-br-xl overflow-hidden w-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
              >
                <Controls position="top-left" />
                <Background variant={BackgroundVariant.Dots} />
              </ReactFlow>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
