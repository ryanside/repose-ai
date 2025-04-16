import { google } from "@ai-sdk/google";
import {
  appendResponseMessages,
  createDataStreamResponse,
  streamText,
} from "ai";
import { generateSuggestions } from "@/app/(chat)/actions";
import { getMostRecentUserMessage, generateUUID } from "@/lib/utils";
import { getChatById, saveChat, saveMessages } from "@/lib/db";
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      id,
      messages,
      fromSuggestionId = undefined,
      selectedChatModel = "gemini-2.0-flash-001",
    } = await req.json();

    // last user message (which would be a role: user message)
    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response("No user message found", { status: 400 });
    }

    // check if the chat exists
    const chat = await getChatById({ id });

    // if the chat does not exist, create it
    if (!chat) {
      await saveChat({ id: id, title: userMessage.content });
    }

    await saveMessages({
      message: [
        {
          id: userMessage.id,
          chatId: id,
          role: "user",
          parts: userMessage.parts,
          fromSuggestionId: fromSuggestionId,
          annotations: userMessage.annotations,
          createdAt: new Date(),
        },
      ],
    });

    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: google(selectedChatModel, {
            useSearchGrounding: true,
          }),
          system: `
        - you are a research assistant designed to generate rich, contextual, and up-to-date overviews using the latest search grounding sources.
          - when provided with search results, your task is to:
            - synthesize information: combine key insights from multiple sources to construct a comprehensive answer that reflects current trends and the most recent context on the topic.
            - ground your response: ensure that every claim or detail in your answer is directly supported by the provided search results. If there is conflicting information, acknowledge discrepancies and note areas of uncertainty.
            - cite sources: reference the sources or provide direct quotes to help the reader verify the information.
            - provide context and nuance: detail not only the core facts but also relevant background context, emerging trends, and nuances informed by recent developments.
            - stay up-to-date: focus on the newest insights and validated information available from the search results without relying on outdated or unverified data.
          `,
          messages,
          maxSteps: 2,
          temperature: 0.8,
          onFinish: async ({ response, sources, text }) => {
            // generate suggestions based onthe AI response text
            const suggestions = await generateSuggestions({
              messageContent: text,
              messageId: userMessage.id,
            });
            // write the suggestions to the data stream
            dataStream.writeMessageAnnotation({
              suggestions: suggestions,
              fromSuggestionId,
            });

            try {
              // Appends the ResponseMessage[] from the response to a Message[] (for useChat). The messages are converted to Messages before being appended.
              const [, assistantMessage] = appendResponseMessages({
                messages: [userMessage],
                responseMessages: response.messages,
              });

              // generate a new assistant message id
              const newAssistantId = generateUUID();

              // save the assistant message to the database (including the sources)
              await saveMessages({
                message: [
                  {
                    id: newAssistantId,
                    chatId: id,
                    role: "assistant",
                    parts: [
                      ...(assistantMessage.parts ?? []),
                      ...(sources ?? []).map((source) => ({
                        type: "source",
                        source: {
                          id: source.id,
                          url: source.url,
                          title: source.title,
                        },
                      })),
                    ],
                    fromSuggestionId: fromSuggestionId,
                    annotations: { suggestions, fromSuggestionId },
                    createdAt: new Date(),
                  },
                ],
              });
            } catch (error) {
              console.error("Error saving assistant message:", error);
            }
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, { sendSources: true });
      },
      onError: () => {
        return "An error occured";
      },
    });
  } catch (error) {
    console.error("Error in POST route:", error);
    return new Response("An error occured while processing your request!", {
      status: 404,
    });
  }
}
