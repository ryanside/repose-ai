// Utility function to parse code blocks from AI responses
export function parseCodeBlocksFromMessage(messageText: string) {
  // Define a type for comment styles
  type CommentStyleMap = {
    [key: string]: RegExp;
  };

  // Array to store extracted code blocks
  const codeBlocks: Array<{
    language: string;
    code: string;
    expectedOutput: string;
  }> = [];

  // Advanced code block extraction with regex
  const regex = /```([a-zA-Z0-9]+)?\s*([\s\S]*?)```/g;
  let match;

  // Normalized language mapping
  const languageMap: { [key: string]: string } = {
    cpp: "C++",
    csharp: "C#",
  };

  while ((match = regex.exec(messageText)) !== null) {
    let language = match[1]?.toLowerCase() || "plaintext";
    const code = match[2].trim();

    // Normalize language name
    language = languageMap[language] || language;

    let expectedOutput = "";

    // Try to find output comment in multiple ways
    const outputCommentRegexes = [
      /(?:^|\s*)(?:\/\/|#)\s*Output:\s*(.+)$/gm, // Start of line or after whitespace
      /print\([^)]*\)\s*(?:\/\/|#)\s*Output:\s*(.+)$/gm, // After print statement
    ];

    for (const regex of outputCommentRegexes) {
      const outputComments = code.match(regex);

      if (outputComments) {
        expectedOutput = outputComments
          .map((comment) =>
            comment
              .replace(
                /(?:^.*(?:\/\/|#)\s*Output:\s*|print\([^)]*\)\s*(?:\/\/|#)\s*Output:\s*)/,
                ""
              )
              .trim()
          )
          .join("\n");

        // Stop if we found an output
        if (expectedOutput) break;
      }
    }

    // Fallback if no output found
    if (!expectedOutput) {
      expectedOutput = "Code executed successfully!";
    }

    // Remove output comments from the code
    const cleanedCode = code
      .replace(/(?:^|\s*)(?:\/\/|#)\s*Output:.+$/gm, "")
      .replace(/print\([^)]*\)\s*(?:\/\/|#)\s*Output:.+$/gm, "")
      .trim();

    codeBlocks.push({
      language,
      code: cleanedCode,
      expectedOutput,
    });
  }

  // Generate a clean version of the message with code blocks removed
  const cleanedMessage = messageText.replace(regex, "");

  return {
    codeBlocks,
    cleanedMessage,
  };
}
