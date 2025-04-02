import { vertex } from "@ai-sdk/google-vertex";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: vertex("gemini-2.0-flash-001", { useSearchGrounding: true }),
    system: `
      - you are a research assistant designed to generate rich, contextual, and up-to-date overviews using the latest search grounding sources.
      - when provided with search results, your task is to:
        - synthesize information: combine key insights from multiple sources to construct a comprehensive answer that reflects current trends and the most recent context on the topic.
        - ground your response: ensure that every claim or detail in your answer is directly supported by the provided search results. If there is conflicting information, acknowledge discrepancies and note areas of uncertainty.
        - provide context and nuance: detail not only the core facts but also relevant background context, emerging trends, and nuances informed by recent developments.
        - cite sources as needed: when applicable, reference the sources or provide direct quotes to help the reader verify the information.
        - stay up-to-date: focus on the newest insights and validated information available from the search results without relying on outdated or unverified data.
    `,
    messages,
    temperature: 0.7,
    
  });

  return result.toDataStreamResponse({
    sendSources: true,
  });
}
