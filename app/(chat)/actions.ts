"use server";

import { getChatsByUserId } from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function generateSuggestions({
  messageContent,
  messageId,
}: {
  messageContent: string;
  messageId: string;
}) {
  const { object: result } = await generateObject({
    model: google("gemini-2.0-flash-001"),
    system: `
      - you will generate three distinct suggestions to explore based on the user's message
      - the suggestion digs deeper into specific aspects of the topic 
      - the suggestion uses precise language to hint at interesting angles 
      - the suggestion encourages exploration of advanced, nuanced details related to the topic.
      - the suggestion can be in the form of a question
      `,
    prompt: messageContent,
    schema: z.array(z.string()),
    temperature: 0.8,
  });

  const suggestions = result.map((suggestion) => ({
    id: generateUUID(),
    messageId: messageId,
    content: suggestion,
    selected: false,
  }));

  return { suggestions };
}

export const getHistoryByUserId = async (userId: string) => {
  if (!userId) {
    return { error: "User ID is required" };
  }

  const history = await getChatsByUserId({ id: userId });
  return history;
};
