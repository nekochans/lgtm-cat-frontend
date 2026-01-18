// 絶対厳守：編集前に必ずAI実装ルールを読む

// server-only: このモジュールはサーバーでのみ実行される
// Client Componentからインポートしようとするとビルドエラーになる
import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";

// 外部ファイルからコードサンプルを読み込み (単一ソース運用)
// code-examples/mcp/ ディレクトリの .json/.yml ファイルを唯一のソースとして管理
const codeExamplesDir = join(
  process.cwd(),
  "src/features/docs/code-examples/mcp"
);

/**
 * MCP設定ファイルのサンプルを読み込む (SSE直接サポート版)
 * ソース: code-examples/mcp/mcp-servers.json
 * React cache() で同一リクエスト内の重複読み込みを防止
 */
export const loadMcpServersJson = cache(async (): Promise<string> => {
  const content = await readFile(
    join(codeExamplesDir, "mcp-servers.json"),
    "utf-8"
  );
  return JSON.stringify(JSON.parse(content), null, 2);
});

/**
 * Claude Code Action用のGitHub Actionsワークフローを読み込む
 * ソース: code-examples/mcp/claude-auto-review.yml
 * React cache() で同一リクエスト内の重複読み込みを防止
 */
export const loadClaudeAutoReviewYaml = cache(async (): Promise<string> => {
  return await readFile(
    join(codeExamplesDir, "claude-auto-review.yml"),
    "utf-8"
  );
});

/**
 * Codex Action用のGitHub Actionsワークフローを読み込む
 * ソース: code-examples/mcp/codex-auto-review.yml
 * React cache() で同一リクエスト内の重複読み込みを防止
 */
export const loadCodexAutoReviewYaml = cache(async (): Promise<string> => {
  return await readFile(
    join(codeExamplesDir, "codex-auto-review.yml"),
    "utf-8"
  );
});

/**
 * 外部コードファイルの型定義
 * DocsMcpPageコンポーネントにpropsとして渡す
 */
export interface McpExternalCodes {
  readonly mcpServersJson: string;
  readonly claudeAutoReviewYaml: string;
  readonly codexAutoReviewYaml: string;
}

/**
 * 全ての外部コードファイルをパラレルで読み込む
 * page.tsxから呼び出してPromise.allで並列取得
 * React cache()により同一リクエスト内で複数回呼び出しても重複読み込みしない
 */
export async function loadAllMcpExternalCodes(): Promise<McpExternalCodes> {
  const [mcpServersJson, claudeAutoReviewYaml, codexAutoReviewYaml] =
    await Promise.all([
      loadMcpServersJson(),
      loadClaudeAutoReviewYaml(),
      loadCodexAutoReviewYaml(),
    ]);

  return {
    mcpServersJson,
    claudeAutoReviewYaml,
    codexAutoReviewYaml,
  };
}
