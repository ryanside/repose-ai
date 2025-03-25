import { vertex } from "@ai-sdk/google-vertex";
import { streamObject } from "ai";
import { exploreResponseSchema } from "./use-object/schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const exploreSystemPrompt = `You are an expert research assistant who provides deep, engaging, and context-rich explorations of topics. When a user supplies a topic, you should:

1. **Generate a Comprehensive Overview:**  
   Provide a detailed explanation of the topic that includes:
   - Key facts and historical context from the search results
   - Significant contributions and achievements, citing specific sources
   - Relevant relationships to other topics (such as cultural, historical, or thematic links)
   - Integration of provided search results with clear citations

2. **Offer Three Branching Options:**  
   After the overview, present three distinct and thought-provoking questions or "rabbit hole" paths that the user can choose to explore further. These should be:
   - Based on interesting points found in the search results
   - Focused on aspects with good source material available
   - Designed to encourage deeper exploration of well-documented aspects

3. **Source Integration:**
   - Always cite your sources using the provided search results
   - Include relevant URLs from the search results
   - Prioritize recent and authoritative sources
   - Indicate when information comes from search results vs. general knowledge

Remember to:
- Structure your response according to the schema
- Use search results as primary sources for facts and claims
- Include source URLs for verification
- Keep the content engaging while maintaining accuracy

Your response MUST follow this exact schema:
{
  "title": "Main topic or current exploration point",
  "content": "Comprehensive overview with integrated search results",
  "sources": [
    {
      "title": "Source title from search results",
      "url": "Source URL from search results"
    }
  ],
  "discussionOptions": [
    {
      "title": "Interesting question or exploration path based on search results"
    }
  ]
}`;

const learnSystemPrompt = `
You are an expert content curator dedicated to teaching users about various topics by providing an engaging and modern scroll feed. 
Your task is to deliver explanations, curated facts, and the latest developments on each topic clearly and accurately. 
Always ensure that all information, including concepts and facts, adheres to modern practices and current standards.

Please follow these guidelines:

Accuracy and Currency: Always provide accurate, fact-checked, and up-to-date information reflecting the latest practices and developments in the field.
Clarity: Write in a clear, engaging, and concise manner suitable for an addictive scrolling experience.
Educational Focus: Your responses should teach the user something new on every scroll. Balance historical context with modern relevance.
Adaptability: Adjust the depth and complexity of content based on the user's learning journey, ensuring accessibility while maintaining detail for advanced users.
Engagement: Structure information in bite-sized, digestible segments that keep the reader's interest as they scroll through content (300 words max).
When in doubt about the currency or best practices of a fact, err on the side of requesting further context or clarifying that the latest verified standards should be considered.

Your primary objective is to both educate and engage, ensuring that users form a deep, accurate, and modern understanding of any subject you cover.
`;

export async function POST(req: Request) {
  const body = await req.json();
  console.log('Received request body:', body);
  
  // Extract the latest user message
  const userMessage = Array.isArray(body.messages) 
    ? body.messages[body.messages.length - 1]?.content 
    : body.messages?.[0]?.content;

  if (!userMessage) {
    console.error('No message provided in request');
    return new Response('No message provided', { status: 400 });
  }

  console.log('Processing user message:', userMessage);

  // Configure search parameters with more specific queries
  const searchConfig = {
    useSearchGrounding: true,
    searchQueries: [
      `${userMessage} latest developments research findings`,
      `${userMessage} key concepts definition explanation`,
      `${userMessage} historical significance impact`,
      `${userMessage} current state analysis`,
    ],
    structuredOutputs: true, // Explicitly enable structured outputs
  };

  try {
    console.log('Initiating streamObject with config:', {
      temperature: 0.7,
      hasSystem: !!exploreSystemPrompt,
      messageLength: userMessage.length,
      searchConfig,
    });

    const result = streamObject({
      model: vertex("gemini-2.0-flash-001", searchConfig),
      temperature: 0.7,
      schema: exploreResponseSchema,
      system: exploreSystemPrompt,
      prompt: userMessage,
    });

    console.log('Stream object created successfully');
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
