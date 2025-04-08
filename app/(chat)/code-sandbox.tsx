"use client";

import { useState, useEffect } from "react";

interface CodeSandboxProps {
  code: string;
  language: string;
  expectedOutput: string;
}

export default function CodeSandbox({
  code,
  language,
  expectedOutput,
}: CodeSandboxProps) {
  const [output, setOutput] = useState<string | null>(null);

  // Automatically show output on mount
  useEffect(() => {
    // Small delay to make it feel like it "ran"
    const timer = setTimeout(() => {
      setOutput(expectedOutput);
    }, 300);

    return () => clearTimeout(timer);
  }, [expectedOutput]);

  return (
    <div className="rounded-lg border border-border shadow-sm overflow-hidden my-4">
      {/* Header - Just language indicator */}
      <div className="flex items-center bg-accent/40 px-4 py-2 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm font-medium ml-2">{language}</div>
      </div>

      {/* Code and Output */}
      <div className="flex flex-col lg:flex-row">
        {/* Code Display */}
        <div className="lg:w-1/2 border-r border-border">
          <div className="bg-slate-900 text-slate-50 p-4 font-mono text-sm overflow-auto">
            <pre className="whitespace-pre-wrap">{code}</pre>
          </div>
        </div>

        {/* Output Display */}
        <div className="lg:w-1/2">
          <div className="bg-slate-800 text-slate-50 p-4 font-mono text-sm overflow-auto">
            <div className="text-xs text-slate-400 mb-2">Output:</div>
            <pre className="whitespace-pre-wrap">{output || "..."}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
