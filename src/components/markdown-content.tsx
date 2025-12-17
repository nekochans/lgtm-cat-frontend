// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";
import Markdown from "react-markdown";

type Props = {
  readonly content: string;
};

export function MarkdownContent({ content }: Props): JSX.Element {
  return (
    <article className="w-full">
      <Markdown
        components={{
          // タイトル（h1）
          h1: ({ children }) => (
            <h1 className="mb-5 text-center font-bold text-orange-900 text-xl leading-7">
              {children}
            </h1>
          ),
          // 見出し（h2）
          h2: ({ children }) => (
            <h2 className="mt-6 mb-2 font-bold text-orange-900 text-xl leading-7">
              {children}
            </h2>
          ),
          // 段落
          p: ({ children }) => (
            <p className="mb-4 text-base text-orange-950 leading-6">
              {children}
            </p>
          ),
          // 順序付きリスト
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal pl-6 text-base text-orange-900 leading-6">
              {children}
            </ol>
          ),
          // リスト項目
          li: ({ children }) => <li className="mb-1">{children}</li>,
          // リンク
          a: ({ href, children }) => (
            <a
              className="text-orange-700 underline hover:text-orange-900"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {children}
            </a>
          ),
          // 順序なしリスト
          ul: ({ children }) => (
            <ul className="mb-4 list-disc pl-6 text-base text-orange-900 leading-6">
              {children}
            </ul>
          ),
        }}
      >
        {content}
      </Markdown>
    </article>
  );
}
