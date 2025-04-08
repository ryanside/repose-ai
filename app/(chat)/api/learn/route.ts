import { vertex } from "@ai-sdk/google-vertex";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Extract the user's query from the last message
  const userQuery = messages[messages.length - 1].content;

  // Detect if the query is about a technical skill
  const technicalTopics = [
    "python",
    "javascript",
    "java",
    "c++",
    "c#",
    "ruby",
    "golang",
    "go lang",
    "typescript",
    "php",
    "swift",
    "kotlin",
    "rust",
    "scala",
    "html",
    "css",
    "sql",
    "nosql",
    "react",
    "vue",
    "angular",
    "node",
    "django",
    "flask",
    "express",
    "spring",
    "laravel",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "devops",
    "machine learning",
    "ml",
    "ai",
    "artificial intelligence",
    "data science",
    "blockchain",
    "coding",
    "programming",
    "development",
  ];

  const isTechnicalTopic = technicalTopics.some((topic) =>
    userQuery.toLowerCase().includes(topic.toLowerCase())
  );

  const result = streamText({
    model: vertex("gemini-2.0-flash-001", { useSearchGrounding: true }),
    system: `
      - You are a quick-bite learning assistant designed for fast, engaging knowledge consumption.
      - Your goal is to deliver concise, high-impact learning content perfect for scrolling.
      - Keep responses SHORT - aim for no more than 3-5 short paragraphs maximum.
      - When provided with search results, your task is to:
      
        ${
          isTechnicalTopic
            ? `
        - For this technical topic:
          - Start with ONE ultra-simple example (like a single line of code for programming)
          - Include at least one code sample using markdown code blocks with the appropriate language tag (e.g. \`\`\`python)
          - Make sure your code examples are runnable and demonstrate a clear output when possible
          - Keep code examples extremely simple - focus on just what a beginner needs to understand
          - Explain ONE core concept in a single sentence with a relatable analogy
          - Use casual, friendly language as if texting a friend
        `
            : `
        - For this general knowledge topic:
          - Give a single fascinating fact that hooks interest
          - Explain why this topic matters in one sentence
          - Share one surprising connection to everyday life
          - Focus on the most visually imaginable or relatable aspect
          - Make it conversational and light
        `
        }
        
        - Always:
          - Be extremely concise - each paragraph should be 1-3 sentences maximum
          - Use simple words and short sentences
          - Include one specific action or next step the person could take
          - Write in a casual, conversational tone
          - End with a hook question that makes them curious to learn more
          - Avoid long explanations, history, or theory - focus on immediate understanding
          - Make information feel bite-sized and immediately useful
    `,
    messages,
    temperature: 0.8,
    onFinish: (message) => {
      console.log(message);
    },
  });

  return result.toDataStreamResponse({
    sendSources: true,
  });
}
