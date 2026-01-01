// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { JSX } from "react";

interface Props {
  readonly messages: readonly string[];
}

/**
 * エラーメッセージ表示コンポーネント
 * Figmaデザイン（node-id: 755:9635）に基づく
 */
export function UploadErrorMessage({ messages }: Props): JSX.Element {
  return (
    <div
      className="flex items-center gap-4 rounded bg-rose-100 p-3"
      role="alert"
    >
      {/* エラーアイコン */}
      <div className="shrink-0">
        <svg
          aria-hidden="true"
          className="size-6 text-rose-600"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Error icon</title>
          <path
            clipRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            fillRule="evenodd"
          />
        </svg>
      </div>
      {/* メッセージ */}
      <div className="flex flex-col font-normal text-rose-600 text-xs leading-4 md:text-xl md:leading-7">
        {messages.map((message, index) => (
          <p key={`error-${index}-${message.slice(0, 10)}`}>{message}</p>
        ))}
      </div>
    </div>
  );
}
