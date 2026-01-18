// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { Snippet } from "@heroui/react";

interface CodeSnippetProps {
  readonly code: string;
  readonly variant?: "block" | "inline";
}

/**
 * コードブロックを表示するクライアントコンポーネント
 * HeroUI の Snippet コンポーネントをラップ
 */
export function CodeSnippet({ code, variant = "block" }: CodeSnippetProps) {
  if (variant === "inline") {
    return (
      <Snippet
        className="w-fit"
        classNames={{
          base: "bg-white border border-orange-200",
          pre: "font-mono text-orange-900",
          copyButton: "text-orange-600 hover:text-orange-800",
        }}
        hideSymbol
        variant="flat"
      >
        {code}
      </Snippet>
    );
  }

  return (
    <Snippet
      className="w-full max-w-full"
      classNames={{
        base: "bg-orange-50 border border-orange-200",
        pre: "font-mono text-orange-900 whitespace-pre text-sm",
        copyButton: "text-orange-600 hover:text-orange-800",
        content: "overflow-x-auto",
      }}
      hideSymbol
      variant="flat"
    >
      {code}
    </Snippet>
  );
}
