import { z } from "zod";

// Schema for source citations
const sourceSchema = z.object({
  title: z.string().describe("The title of the source"),
  url: z.string().url().describe("The URL of the source"),
  snippet: z.string().optional().describe("A relevant excerpt from the source"),
});

// Schema for discussion options
const discussionOptionSchema = z.object({
  title: z.string().describe("The title of the discussion option"),
  description: z.string().optional().describe("Optional description of what this path will explore"),
  relatedSources: z.array(z.string()).optional().describe("URLs of sources relevant to this discussion option"),
});

// Schema for the response from the explore system prompt
export const exploreResponseSchema = z.object({
  title: z.string().describe("The main topic or current exploration point"),
  content: z.string().describe("Comprehensive overview with integrated search results"),
  sources: z.array(sourceSchema).describe("The search grounding sources used to create the overview"),
  discussionOptions: z.array(discussionOptionSchema).describe("Available paths for further exploration"),
  metadata: z.object({
    lastUpdated: z.string().optional().describe("The most recent date mentioned in the sources"),
    confidence: z.number().min(0).max(1).optional().describe("Confidence score based on source quality"),
  }).optional(),
});

// Schema for the response from the learn system prompt
export const learnResponseSchema = z.object({
  title: z.string(),
  content: z.string(),
  source: sourceSchema,
});
