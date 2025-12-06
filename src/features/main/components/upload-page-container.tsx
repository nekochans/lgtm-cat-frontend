// 絶対厳守：編集前に必ずAI実装ルールを読む

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Language } from "@/features/language";
import { UploadForm } from "@/features/upload/components/upload-form";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
};

export function UploadPageContainer({ language, currentUrlPath }: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header
        currentUrlPath={currentUrlPath}
        isLoggedIn={false}
        language={language}
      />
      <main className="relative flex w-full flex-1 flex-col items-center px-4 py-8">
        {/* モーダル風の背景オーバーレイ */}
        <div className="absolute inset-0 bg-black/50" />
        {/* フォームコンテナ（オーバーレイの上に表示） */}
        <div className="relative z-10 w-full max-w-[700px]">
          <UploadForm language={language} />
        </div>
      </main>
      <Footer language={language} />
    </div>
  );
}
