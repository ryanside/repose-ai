import { google } from "@ai-sdk/google";
import { createDataStreamResponse, streamText } from "ai";
import { generateSuggestions } from "@/app/(chat)/actions";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, fromSuggestionId = undefined } = await req.json();
  // Last user message id to link to the suggestions
  const lastUserMessageId = messages[messages.length - 1].id;

  // Extract the user's query from the last message
  const userQuery = messages[messages.length - 1].content;

  // Detect if the query is about a technical topic
  const technicalTopics = [
    "python",
    "javascript",
    "java",
    "coding",
    "programming",
    "react",
    "typescript",
    "html",
    "css",
    "sql",
    "database",
    "algorithm",
    "data structure",
    "machine learning",
    "ai",
    "web development",
    "app development",
    "software engineering",
  ];

  const isTechnicalTopic = technicalTopics.some((topic) =>
    userQuery.toLowerCase().includes(topic.toLowerCase())
  );

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: google("gemini-2.0-flash-001", {
          useSearchGrounding: true,
        }),
        system: `
        - You are a teaching assistant designed to deliver engaging, concise learning content.
        - Your goal is to create bite-sized educational content that's easy to understand.
        - Format your responses for maximum clarity and visual organization:
          - Use clear section headers with emoji icons
          - Break complex ideas into bullet points
          - Bold important concepts
          - Use markdown formatting extensively
        
        ${
          isTechnicalTopic
            ? `
        - For this technical topic:
          - Start with a **Key Concept** section that explains one fundamental idea
          - Include at least one code example using markdown code blocks with the appropriate language tag
          - Make sure code examples are simple and demonstrate clear output
          - End with a **Practice Exercise** section that gives the learner something to try
        `
            : `
        - For this general knowledge topic:
          - Start with a **Quick Overview** section that provides context
          - Include a **Key Points** section with 3-5 bullet points of essential information
          - End with a **Did You Know?** section containing one fascinating fact
        `
        }
        
        - Always:
          - Keep explanations concise and focused
          - Use simple examples that relate to everyday experiences
          - End with a thoughtful question to spark further learning
          - Include helpful visuals whenever possible
          - Write in a friendly, conversational tone
        `,
        messages,
        temperature: 0.7,
        onFinish: async (res) => {
          const suggestions = await generateSuggestions({
            messageContent: res.text,
            messageId: lastUserMessageId,
          });

          dataStream.writeMessageAnnotation({
            suggestions: suggestions,
            fromSuggestionId,
          });
        },
      });

      result.mergeIntoDataStream(dataStream, { sendSources: true });
    },
  });
}
