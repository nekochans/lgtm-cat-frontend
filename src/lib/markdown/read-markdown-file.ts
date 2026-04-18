// 絶対厳守：編集前に必ずAI実装ルールを読む

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Language } from "@/types/language";

/**
 * ドキュメントの種類
 * - terms: 利用規約
 * - privacy: プライバシーポリシー
 * - external-transmission: 外部送信ポリシー
 */
type DocType = "terms" | "privacy" | "external-transmission";

/**
 * src/features/ 配下のマークダウンファイルを読み込む
 * @param docType ドキュメントの種類
 * @param language 言語
 * @returns マークダウンコンテンツ（読み込み失敗時は null）
 */
export async function readMarkdownFile(
  docType: DocType,
  language: Language
): Promise<string | null> {
  const docTypeToDir: Record<DocType, string> = {
    terms: "terms",
    privacy: "privacy",
    "external-transmission": "external-transmission-policy",
  };

  const dirName = docTypeToDir[docType];
  const fileName = language === "en" ? `${docType}.en.md` : `${docType}.ja.md`;
  const filePath = join(
    process.cwd(),
    "src",
    "features",
    dirName,
    "markdown",
    fileName
  );

  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}
