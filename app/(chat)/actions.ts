'use server';

import { vertex } from "@ai-sdk/google-vertex";
import { generateObject, generateText } from "ai";
import { z } from "zod";

export async function generateBranches({
  messageContent,
}: {
  messageContent: string;
}) {
  const { object: result } = await generateObject({
    model: vertex("gemini-2.0-flash-001"),
    system: `
      - you will generate three distinct branches of learning based on the user's message
      - the branch digs deeper into specific aspects of the topic 
      - the branch uses precise language to hint at interesting angles 
      - the branch encourages exploration of advanced, nuanced details related to the topic.
      - the branch should be in the form of a question
      `,
    prompt: messageContent,
    schema: z.object({
      branches: z.array(z.string()),
    })
  });

  return { result };
}

