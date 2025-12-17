// 絶対厳守：編集前に必ずAI実装ルールを読む
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import type { Language } from "@/features/language";

/**
 * ドキュメントの種類
 * - terms: 利用規約
 * - privacy: プライバシーポリシー
 * - external-transmission: 外部送信ポリシー
 */
type DocType = "terms" | "privacy" | "external-transmission";

/**
 * src/docs/ 配下のマークダウンファイルを読み込む汎用関数
 * 静的コンテンツのため長期キャッシュを適用
 * @param docType ドキュメントの種類
 * @param language 言語
 * @returns マークダウンコンテンツ
 */
export async function loadMarkdown(
  docType: DocType,
  language: Language
): Promise<string> {
  "use cache";
  cacheLife({
    // 静的コンテンツのため長期キャッシュ（デプロイで更新）
    stale: 2_592_000, // 30日間フレッシュ扱い
    revalidate: 2_592_000, // 30日ごとに再検証
    expire: 31_536_000, // 1年で強制失効
  });

  const fileName = language === "en" ? `${docType}.en.md` : `${docType}.ja.md`;
  const filePath = join(process.cwd(), "src", "docs", fileName);

  try {
    const content = await readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Failed to load markdown file: ${filePath}`, error);
    notFound();
  }
}
