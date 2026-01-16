// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { ComponentProps } from "react";
import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import { UploadForm } from "@/features/upload/components/upload-form";
import type { IncludeLanguageAppPath } from "@/features/url";

/**
 * UploadForm の Props から language を除外した型
 * UploadPage から UploadForm へ props を伝播するために使用
 */
type UploadFormProps = Omit<ComponentProps<typeof UploadForm>, "language">;

interface Props extends UploadFormProps {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}

export function UploadPage(props: Props) {
  const { language, currentUrlPath, ...uploadFormProps } = props;

  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    >
      {/* モーダル風の背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/50" />
      {/* フォームコンテナ (オーバーレイの上に表示) */}
      <div className="relative z-10 w-full max-w-[700px]">
        <UploadForm language={language} {...uploadFormProps} />
      </div>
    </PageLayout>
  );
}
