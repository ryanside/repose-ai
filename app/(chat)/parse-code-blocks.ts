// Utility function to parse code blocks from AI responses
export function parseCodeBlocksFromMessage(messageText: string) {
  // Array to store extracted code blocks
  const codeBlocks: Array<{
    language: string;
    code: string;
    expectedOutput: string;
  }> = [];

  // Find all code blocks in the message
  // Match code blocks with ```language and ``` format
  const regex = /```([a-zA-Z0-9]+)?\s*([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(messageText)) !== null) {
    const language = match[1] || "plaintext";
    const code = match[2].trim();

    // Calculate expected output based on the code
    // This is a simplified simulation for common languages
    let expectedOutput = "";

    if (language === "python") {
      if (code.includes("print(")) {
        // Extract content from print statements
        const printRegex = /print\((.*?)\)/g;
        let printMatch;
        let outputs = [];

        while ((printMatch = printRegex.exec(code)) !== null) {
          let content = printMatch[1].trim();
          // Handle string literals
          if (
            (content.startsWith('"') && content.endsWith('"')) ||
            (content.startsWith("'") && content.endsWith("'"))
          ) {
            content = content.slice(1, -1);
          } else if (content.includes("+")) {
            // Simple string concatenation
            content = content
              .split("+")
              .map((p) => {
                p = p.trim();
                if (
                  (p.startsWith('"') && p.endsWith('"')) ||
                  (p.startsWith("'") && p.endsWith("'"))
                ) {
                  return p.slice(1, -1);
                }
                return p;
              })
              .join("");
          }
          outputs.push(content);
        }
        expectedOutput = outputs.join("\n");
      }
    } else if (language === "javascript" || language === "js") {
      if (code.includes("console.log(")) {
        // Extract content from console.log statements
        const logRegex = /console\.log\((.*?)\)/g;
        let logMatch;
        let outputs = [];

        while ((logMatch = logRegex.exec(code)) !== null) {
          let content = logMatch[1].trim();
          // Handle string literals
          if (
            (content.startsWith('"') && content.endsWith('"')) ||
            (content.startsWith("'") && content.endsWith("'"))
          ) {
            content = content.slice(1, -1);
          } else if (content.includes("+")) {
            // Simple string concatenation
            content = content
              .split("+")
              .map((p) => {
                p = p.trim();
                if (
                  (p.startsWith('"') && p.endsWith('"')) ||
                  (p.startsWith("'") && p.endsWith("'"))
                ) {
                  return p.slice(1, -1);
                }
                return p;
              })
              .join("");
          }
          outputs.push(content);
        }
        expectedOutput = outputs.join("\n");
      }
    } else if (language === "java") {
      if (code.includes("System.out.println(")) {
        // Extract content from System.out.println statements
        const printlnRegex = /System\.out\.println\((.*?)\)/g;
        let printlnMatch;
        let outputs = [];

        while ((printlnMatch = printlnRegex.exec(code)) !== null) {
          let content = printlnMatch[1].trim();
          // Handle string literals
          if (
            (content.startsWith('"') && content.endsWith('"')) ||
            (content.startsWith("'") && content.endsWith("'"))
          ) {
            content = content.slice(1, -1);
          }
          outputs.push(content);
        }
        expectedOutput = outputs.join("\n");
      }
    }

    // Simple fallback for other languages or if no print/log statements found
    if (!expectedOutput) {
      if (language === "python" && code.includes("def ")) {
        expectedOutput = "Function defined successfully!";
      } else if (language === "html") {
        expectedOutput = "HTML rendered in the browser";
      } else if (language === "css") {
        expectedOutput = "Styles applied successfully";
      } else if (code.length > 0) {
        expectedOutput = "Code executed successfully!";
      }
    }

    codeBlocks.push({
      language,
      code,
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
