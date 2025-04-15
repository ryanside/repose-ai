"use client";

import * as React from "react";

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
  return (
    <div className="rounded-xl border border-border shadow-sm overflow-hidden my-4 bg-background">
      {/* Header with Language */}
      <div className="flex items-center p-3 bg-gray-100 text-gray-800">
        <span className="font-medium text-sm capitalize">
          {language} Code Example
        </span>
      </div>

      {/* Code Display */}
      <div className="flex flex-col md:flex-row">
        {/* Code Section */}
        <div className="md:w-1/2 bg-slate-900 text-slate-50">
          <div className="p-4 font-mono text-sm overflow-auto">
            <pre className="whitespace-pre-wrap">{code}</pre>
          </div>
        </div>

        {/* Output Section */}
        <div className="md:w-1/2 bg-slate-800 text-slate-50">
          <div className="p-4 font-mono text-sm">
            <div className="text-xs text-slate-400 mb-2">Output:</div>
            <pre className="whitespace-pre-wrap text-slate-200">
              {expectedOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
