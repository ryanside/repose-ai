"use client";

import { useChat, Message } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { generateBranches } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { tryCatch } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import CodeSandbox from "./code-sandbox";
import { parseCodeBlocksFromMessage } from "./parse-code-blocks";
import YouTubeShorts from "./youtube-shorts";

// Custom hook for keyboard navigation
function useKeyboardNavigation(onDownArrow: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // If down arrow key is pressed
      if (event.key === "ArrowDown") {
        onDownArrow();
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDownArrow]);
}

export default function Chat() {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("");
  const [branches, setBranches] = useState<string[]>([]);
  const [mode, setMode] = useState<string>("explore");
  const [currentLesson, setCurrentLesson] = useState<number>(1);
  const [lessonTopic, setLessonTopic] = useState<string>("");
  // Track lesson progression
  const [lessonSequence, setLessonSequence] = useState<string[]>([]);

  // Set up keyboard navigation for down arrow
  useKeyboardNavigation(() => {
    if (mode === "learn" && !isGenerating) {
      handleNextLesson();
    }
  });

  // Learn mode specific functions
  const generateNextLessonPrompt = (learnedTopics: string[]): string => {
    if (learnedTopics.length === 0) return "";

    // Create a prompt that lists what we've already learned
    const mainTopic = lessonTopic || topic;
    let learnedContent = learnedTopics.join(", ");

    // If we're just starting, the first topic is just the main topic
    if (learnedTopics.length === 1) {
      return `I just started learning about ${mainTopic}. What should I learn next as a complete beginner?`;
    }

    return `I'm learning about ${mainTopic}. I've already learned about ${learnedContent}. What should I learn next as a logical progression?`;
  };

  const handleNextLesson = () => {
    if (isGenerating) return;

    // Generate the prompt for the next lesson based on what we've learned
    const nextLessonPrompt = generateNextLessonPrompt(lessonSequence);
    if (!nextLessonPrompt) return;

    setIsGenerating(true);

    // If this is the first lesson, save the main topic
    if (lessonTopic === "") {
      setLessonTopic(topic);
    }

    // Update UI immediately before waiting for response
    setCurrentLesson(currentLesson + 1);

    // Make the API request
    learnChat.append({ role: "user", content: nextLessonPrompt });
  };

  // Initialize separate chat instances for each mode
  const exploreChat = useChat({
    api: "/api/explore",
    onFinish: (message) => {
      handleGeneration(message, topic);
    },
  });

  const learnChat = useChat({
    api: "/api/learn",
    onFinish: (message) => {
      // For learn mode, we update the lesson sequence
      console.log("Learn mode message finished:", message);

      // Extract the lesson topic from the response
      let lessonContent = "";
      if (message.parts?.[0]?.type === "text") {
        lessonContent = message.parts[0].text;
      }

      // Try to extract the topic from the content
      // This is a simplified extraction - in a real app, you might want to use
      // the API to explicitly return a topic title
      const firstLine = lessonContent.split("\n")[0];
      const topicLine =
        firstLine.length > 10 && firstLine.length < 80
          ? firstLine
          : lessonContent.substring(0, 40) + "...";

      // Update the lesson sequence with what we just learned
      if (currentLesson >= lessonSequence.length) {
        setLessonSequence([...lessonSequence, topicLine]);
      }

      setIsGenerating(false);
    },
  });

  // Use the active chat based on the current mode
  const activeChat = mode === "explore" ? exploreChat : learnChat;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTopic(activeChat.input);

    // For learn mode, initialize lesson sequence
    if (mode === "learn") {
      setCurrentLesson(1);
      setLessonTopic("");
      setLessonSequence([activeChat.input]);
    }

    activeChat.append({ role: "user", content: activeChat.input });
  };

  const handleGeneration = async (message: Message, topic: string) => {
    // Only generate branches in explore mode
    if (mode !== "explore") return;

    console.log(message);
    if (message.parts?.[0]?.type === "text") {
      setIsGenerating(true);
      const { data, error } = await tryCatch(
        generateBranches({
          messageContent: message.parts[0].text,
        })
      );

      if (error) {
        console.error("Error generating branches:", error);
        setIsGenerating(false);
        return;
      }

      setBranches(data.result.branches);
      setIsGenerating(false);
    }
  };

  const handleNextInput = (branch: string) => {
    setTopic(branch);
    setIsGenerating(true);
    activeChat.append({ role: "user", content: branch });
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    setBranches([]);

    // Reset lesson state when switching modes
    if (newMode === "learn") {
      setCurrentLesson(1);
      setLessonTopic("");
      setLessonSequence([]);
    }
  };

  // Get messages for current mode
  const messages = activeChat.messages;
  const input = activeChat.input;
  const handleInputChange = activeChat.handleInputChange;
  const status = activeChat.status;

  return (
    <div className="flex flex-col min-h-full w-full overflow-x-hidden">
      {messages.length === 0 ? (
        <div className="flex flex-col flex-1 max-w-7xl w-full gap-8 items-center mx-auto mt-4 pt-12 px-4 xs:pl-8 xs:pr-14 md:pt-[25vh] lg:mt-6 2xl:pr-20 max-sm:!px-1">
          <div className="mx-auto flex w-full flex-col items-center gap-7 max-md:pt-4 max-w-2xl">
            <div className="w-full">
              <div className="grid grid-cols-2 mb-6 gap-2">
                <Button
                  variant={mode === "explore" ? "default" : "outline"}
                  onClick={() => handleModeChange("explore")}
                  className="w-full rounded-xl"
                >
                  🌌 Explore
                </Button>
                <Button
                  variant={mode === "learn" ? "default" : "outline"}
                  onClick={() => handleModeChange("learn")}
                  className="w-full rounded-xl"
                >
                  📚 Learn
                </Button>
              </div>
              <div>
                {mode === "explore" ? (
                  <h1 className="text-4xl font-medium tracking-tight font-serif text-center">
                    🌌 lets <span className="text-primary">explore</span> it
                  </h1>
                ) : (
                  <h1 className="text-4xl font-medium tracking-tight font-serif text-center">
                    📚 lets <span className="text-primary">learn</span> it
                  </h1>
                )}
              </div>
            </div>
          </div>
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSubmit}>
              <div className="relative flex flex-col w-full gap-4 ">
                <div className="flex flex-col">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder={
                      mode === "explore"
                        ? "Enter your topic to explore..."
                        : "What would you like to learn about?"
                    }
                    rows={4}
                    className="min-h-[150px] resize-none rounded-3xl px-4 py-3 shadow-sm font-medium tracking-wide"
                  />
                </div>
                <div className="absolute bottom-0 w-full flex justify-between items-center px-4 pb-3">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="gemini 2.0 flash" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      <SelectItem value="gemini-2.0-flash">
                        gemini 2.0 flash
                      </SelectItem>
                      <SelectItem value="gemini-2.0-flash-lite">
                        gemini 2.0 flash-lite
                      </SelectItem>
                      <SelectItem value="gemini-2.5-pro">
                        gemini 2.5 pro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    variant="default"
                    size="icon"
                    className="rounded-lg bg-primary hover:bg-primary/90"
                  >
                    <ArrowUp className="size-5" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="w-3xl mx-auto space-y-12 px-4 my-4">
          <div className="flex flex-col gap-4">
            <div className="flex space-x-2 self-center">
              <Button
                variant={mode === "explore" ? "default" : "outline"}
                onClick={() => handleModeChange("explore")}
                className="rounded-xl"
                size="sm"
              >
                🌌 Explore
              </Button>
              <Button
                variant={mode === "learn" ? "default" : "outline"}
                onClick={() => handleModeChange("learn")}
                className="rounded-xl"
                size="sm"
              >
                📚 Learn
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-accent/20 space-y-2 ml-48">
              <h1 className="tracking-tight font-medium">
                {mode === "explore" ? "Exploring" : "Learning"}
              </h1>
              <p className="tracking-tight text-muted-foreground">{topic}</p>
            </div>
          </div>

          {status === "submitted" ? (
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[180px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ) : (
            messages
              .filter((message) => message.role === "assistant")
              .map((message) => {
                const messageId = message.id;
                // Parse message content for code blocks
                let messageContent = "";
                let codeBlocks: Array<{
                  language: string;
                  code: string;
                  expectedOutput: string;
                }> = [];

                if (message.parts && message.parts.length > 0) {
                  const textParts = message.parts.filter(
                    (part) => part.type === "text"
                  );
                  if (textParts.length > 0 && textParts[0].type === "text") {
                    const { codeBlocks: extractedBlocks, cleanedMessage } =
                      parseCodeBlocksFromMessage(textParts[0].text);
                    messageContent = cleanedMessage;
                    codeBlocks = extractedBlocks;
                  }
                }

                return (
                  <div key={messageId} className="space-y-4">
                    <div>
                      AI: <div>{messageContent}</div>
                      {/* Render code sandboxes */}
                      {codeBlocks.map((codeBlock, idx) => (
                        <CodeSandbox
                          key={`${messageId}-code-${idx}`}
                          code={codeBlock.code}
                          language={codeBlock.language}
                          expectedOutput={codeBlock.expectedOutput}
                        />
                      ))}
                      {/* Add YouTube Short for Learn mode */}
                      {mode === "learn" && <YouTubeShorts topicQuery={topic} />}
                      {message.parts
                        .filter((part) => part.type === "source")
                        .map((part) => (
                          <span key={`source-${part.source.id}`}>
                            [
                            <a href={part.source.url} target="_blank">
                              {part.source.title ??
                                new URL(part.source.url).hostname}
                            </a>
                            ]
                          </span>
                        ))}
                    </div>
                  </div>
                );
              })
          )}

          {/* Generated Branches - Only show in explore mode */}
          {mode === "explore" && (
            <>
              {isGenerating ? (
                <div className="flex flex-col space-y-3">
                  {[1, 2, 3].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  {branches.map((branch, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="cursor-pointer whitespace-normal text-left h-auto transition-none"
                      onClick={() => handleNextInput(branch)}
                    >
                      {branch}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Learn mode action button */}
          {mode === "learn" && (
            <>
              <div className="flex justify-center mt-6">
                <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                  <div className="relative flex w-full">
                    <Textarea
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask a follow-up question..."
                      rows={1}
                      className="pr-12 rounded-xl"
                    />
                    <Button
                      type="submit"
                      variant="default"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-lg bg-primary hover:bg-primary/90"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                  </div>
                </form>
              </div>

              {/* Next lesson button */}
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="w-full max-w-2xl py-6 rounded-xl bg-accent/30 hover:bg-accent/50 transition-all"
                  onClick={handleNextLesson}
                  disabled={isGenerating}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-medium">
                      Continue Learning
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      {isGenerating
                        ? "Loading next topic..."
                        : `Lesson ${
                            currentLesson + 1
                          }: What's next after ${lessonSequence[
                            lessonSequence.length - 1
                          ]?.substring(0, 30)}...`}
                    </span>
                  </div>
                </Button>
              </div>

              {/* Lesson progress indicator */}
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-1">
                  {[...Array(Math.min(8, currentLesson + 3))].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < currentLesson ? "bg-primary" : "bg-accent/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
