// Utility function to parse code blocks from AI responses
export function parseCodeBlocksFromMessage(messageText: string) {
  // Array to store extracted code blocks
  const codeBlocks: Array<{
    language: string;
    code: string;
  }> = [];

  // Advanced code block extraction with regex
  const regex = /```([a-zA-Z0-9]+)?\s*([\s\S]*?)```/g;
  let match;

  // Normalized language mapping
  const languageMap: { [key: string]: string } = {
    cpp: "C++",
    csharp: "C#",
    js: "JavaScript",
    ts: "TypeScript",
    py: "Python",
    html: "HTML",
    css: "CSS",
  };

  while ((match = regex.exec(messageText)) !== null) {
    let language = match[1]?.toLowerCase() || "plaintext";
    const code = match[2].trim();

    // Normalize language name
    language = languageMap[language] || language;

    // Limit to 1-2 code blocks with simpler content
    codeBlocks.push({
      language,
      code,
    });

    // Only keep the first two code blocks
    if (codeBlocks.length >= 2) break;
  }

  // Generate a clean version of the message with code blocks removed
  const cleanedMessage = messageText.replace(regex, "");

  return {
    codeBlocks,
    cleanedMessage,
  };
}
