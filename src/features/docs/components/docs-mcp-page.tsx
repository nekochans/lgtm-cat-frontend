// 絶対厳守：編集前に必ずAI実装ルールを読む

import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
};

export function DocsMcpPage({ language, currentUrlPath }: Props) {
  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    >
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="font-bold text-3xl text-orange-900">Coming Soon</h1>
        <p className="mt-4 text-orange-800">
          {language === "ja"
            ? "MCPの使い方ページは準備中です"
            : "How to Use MCP page is under construction"}
        </p>
      </div>
    </PageLayout>
  );
}
