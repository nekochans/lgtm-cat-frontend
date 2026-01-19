// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { Snippet } from "@heroui/react";
import { Highlight, Prism, themes } from "prism-react-renderer";
import { useEffect, useState } from "react";

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
  const globalObj = typeof globalThis !== "undefined" ? globalThis : window;
  globalObj.Prism = Prism;
  await import("prismjs/components/prism-yaml");
  isPrismYamlInitialized = true;
}

// サポートする言語の型定義
type SupportedLanguage = "json" | "yaml" | "typescript" | "plaintext";

interface CodeSnippetProps {
  readonly code: string;
  readonly variant?: "block" | "inline";
  readonly language?: SupportedLanguage;
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
 * コードブロックを表示するクライアントコンポーネント
 * HeroUI の Snippet コンポーネントと prism-react-renderer を組み合わせて使用
 * Snippetの標準コピーボタン機能を維持してUIの一貫性を保つ
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

  // プレーンテキストの場合はシンタックスハイライトなし
  if (language === "plaintext") {
    return (
      <Snippet
        className="w-full max-w-full"
        classNames={{
          base: "bg-orange-50 border border-orange-200 overflow-hidden relative",
          pre: "font-mono text-orange-900 whitespace-pre text-sm min-w-0 overflow-x-auto",
          copyButton:
            "text-orange-600 hover:text-orange-800 absolute top-2 right-2",
          content: "overflow-x-auto max-w-full min-w-0",
        }}
        hideSymbol
        variant="flat"
      >
        {code}
      </Snippet>
    );
  }

  // シンタックスハイライト付きのコードブロック
  // HeroUI Snippetのコピー機能を維持しつつ、内部でHighlightを使用
  const prismLanguage = getPrismLanguage(language);

  return (
    <Snippet
      className="w-full max-w-full"
      classNames={{
        base: "bg-orange-50 border border-orange-200 overflow-hidden relative",
        pre: "font-mono whitespace-pre text-sm min-w-0 overflow-x-auto",
        copyButton:
          "text-orange-600 hover:text-orange-800 absolute top-2 right-2",
        content: "overflow-x-auto max-w-full min-w-0",
      }}
      codeString={code}
      hideSymbol
      variant="flat"
    >
      {isPrismReady ? (
        <HighlightedCode code={code} language={prismLanguage} />
      ) : (
        // YAML初期化完了まではプレーンテキストとして表示
        // Snippetの標準preに任せるため、codeをそのまま渡す
        code
      )}
    </Snippet>
  );
}
