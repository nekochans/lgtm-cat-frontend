"use client";

import { Highlight, Prism, themes } from "prism-react-renderer";
import { useCallback, useEffect, useState } from "react";
import { CopyIcon } from "@/components/icons/copy-icon";

// YAML言語の初期化状態を管理（モジュールスコープで共有）
let isPrismYamlInitialized = false;

/**
 * YAML言語をPrismに登録する初期化関数
 * 動的importを使用して順序保証を確保
 */
async function initPrismYaml(): Promise<void> {
  if (isPrismYamlInitialized) {
    return;
  }

  // グローバルPrismを設定してから言語モジュールをインポート
  // prism-yamlはグローバルPrismオブジェクトを参照するため必須
  const globalObj = typeof globalThis === "undefined" ? window : globalThis;
  globalObj.Prism = Prism;
  await import("prismjs/components/prism-yaml");
  isPrismYamlInitialized = true;
}

// サポートする言語の型定義
type SupportedLanguage = "json" | "yaml" | "typescript" | "plaintext";

interface CodeSnippetProps {
  readonly code: string;
  readonly language?: SupportedLanguage;
  readonly variant?: "block" | "inline";
}

/**
 * 言語に応じたPrism言語名を返す
 */
function getPrismLanguage(
  language: SupportedLanguage
): "json" | "yaml" | "typescript" | "markup" {
  switch (language) {
    case "json":
      return "json";
    case "yaml":
      return "yaml";
    case "typescript":
      return "typescript";
    default:
      // plaintext を含む未知の言語はmarkupとして扱う
      return "markup";
  }
}

/**
 * シンタックスハイライト済みのコードをレンダリングする内部コンポーネント
 * 原文保持: trim() は使用せず、コードの原文をそのまま渡す
 */
function HighlightedCode({
  code,
  language,
}: {
  readonly code: string;
  readonly language: "json" | "yaml" | "typescript" | "markup";
}) {
  return (
    <Highlight code={code} language={language} theme={themes.github}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, lineIndex) => {
            const lineProps = getLineProps({ line });
            // 行番号をベースにした安定したキーを生成
            const lineKey = `line-${lineIndex}`;
            return (
              <div key={lineKey} {...lineProps}>
                {line.map((token, tokenIndex) => {
                  const tokenProps = getTokenProps({ token });
                  // 行番号とトークン位置を組み合わせた安定したキーを生成
                  const tokenKey = `${lineIndex}-${tokenIndex}`;
                  return <span key={tokenKey} {...tokenProps} />;
                })}
              </div>
            );
          })}
        </>
      )}
    </Highlight>
  );
}

/**
 * コピーボタンコンポーネント
 * 旧 Snippet コンポーネントのコピー機能を再現
 * 既存の CopyIcon コンポーネントを流用する
 */
function CopyButton({ text }: { readonly text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch {
      // クリップボード書き込み失敗時は何もしない
    }
  }, [text]);

  return (
    <button
      aria-label={isCopied ? "Copied" : "Copy to clipboard"}
      className="text-orange-600 hover:text-orange-800"
      onClick={handleCopy}
      type="button"
    >
      {isCopied ? (
        <svg
          aria-hidden="true"
          fill="none"
          height="16"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="16"
        >
          <title>Copied</title>
          <path
            d="M20 6L9 17l-5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <CopyIcon color="default" height={16} width={16} />
      )}
    </button>
  );
}

/**
 * コードブロックを表示するクライアントコンポーネント
 * カスタム実装で prism-react-renderer を使用したシンタックスハイライトと
 * コピーボタン機能を提供する
 * 原文保持: trim() は使用せず、コードの原文をそのまま渡す
 */
export function CodeSnippet({
  code,
  variant = "block",
  language = "plaintext",
}: CodeSnippetProps) {
  // YAML言語の初期化完了を管理するstate
  const [isPrismReady, setIsPrismReady] = useState(
    // JSON/typescript/plaintextはデフォルトで利用可能、YAMLのみ初期化が必要
    language !== "yaml" || isPrismYamlInitialized
  );

  // language変更時にisPrismReadyを再評価（レビュー指摘対応）
  // 初期値はlanguage依存のため、language変更時に状態を同期する必要がある
  useEffect(() => {
    setIsPrismReady(language !== "yaml" || isPrismYamlInitialized);
  }, [language]);

  // YAML言語の場合は初期化を実行
  useEffect(() => {
    if (language === "yaml" && !isPrismYamlInitialized) {
      initPrismYaml()
        .then(() => {
          setIsPrismReady(true);
        })
        .catch(() => {
          // YAML言語の初期化に失敗した場合はプレーンテキストとして表示
          // コンソールエラーは本番環境で不要なため出力しない
          setIsPrismReady(false);
        });
    }
  }, [language]);

  if (variant === "inline") {
    return (
      <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-orange-200 bg-white px-3 py-1.5">
        <pre className="font-mono text-orange-900">{code}</pre>
        <CopyButton text={code} />
      </div>
    );
  }

  // プレーンテキストの場合はシンタックスハイライトなし
  if (language === "plaintext") {
    return (
      <div className="relative w-full max-w-full overflow-hidden rounded-lg border border-orange-200 bg-orange-50">
        <pre className="min-w-0 overflow-x-auto whitespace-pre p-4 pr-12 font-mono text-orange-900 text-sm">
          {code}
        </pre>
        <div className="absolute top-2 right-2">
          <CopyButton text={code} />
        </div>
      </div>
    );
  }

  // シンタックスハイライト付きのコードブロック
  const prismLanguage = getPrismLanguage(language);

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-lg border border-orange-200 bg-orange-50">
      <pre className="min-w-0 overflow-x-auto whitespace-pre p-4 pr-12 font-mono text-sm">
        {isPrismReady ? (
          <HighlightedCode code={code} language={prismLanguage} />
        ) : (
          // YAML初期化完了まではプレーンテキストとして表示
          code
        )}
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton text={code} />
      </div>
    </div>
  );
}
