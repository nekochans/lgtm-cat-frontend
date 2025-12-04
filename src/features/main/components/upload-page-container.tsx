// 絶対厳守：編集前に必ずAI実装ルールを読む

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
};

export const UploadPageContainer = ({ language, currentUrlPath }: Props) => (
  <div className="flex min-h-screen w-full flex-col bg-background">
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    />
    <main className="flex w-full flex-1 flex-col items-center bg-background">
      <p>TODO: 後でアップロードComponentを配置する</p>
    </main>
    <Footer language={language} />
  </div>
);
