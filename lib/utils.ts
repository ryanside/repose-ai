import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CoreAssistantMessage, CoreToolMessage, UIMessage } from "ai";
import { CustomEdge, CustomNode } from "@/components/explore-chat";
import Dagre from "@dagrejs/dagre";

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}

export function getAssistantMessageContent({
  messages,
}: {
  messages: Array<ResponseMessage>;
}) {
  const assistantMessages = messages.filter(
    (message) => message.role === "assistant"
  );
  const assistantMessage = assistantMessages.at(-1)?.content;
  if (!assistantMessage) {
    return null;
  }
  return assistantMessage;
}

export const getLayoutedElements = (
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
