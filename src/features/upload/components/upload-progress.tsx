// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { Progress } from "@heroui/react";
import Image from "next/image";
import type { JSX } from "react";
import type { Language } from "@/features/language";
import { uploadingText } from "../upload-i18n";

type Props = {
  readonly language: Language;
  readonly previewUrl: string;
  readonly fileName: string;
  readonly progress: number;
};

/**
 * アップロード中の進捗表示コンポーネント
 * Figmaデザイン（node-id: 261:6774）に基づく
 */
export function UploadProgress({
  language,
  previewUrl,
  fileName,
  progress,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      {/* プレビュー画像 */}
      <div className="relative h-[371px] w-[373px]">
        <Image
          alt={`Uploading ${fileName}`}
          className="object-contain"
          fill
          sizes="373px"
          src={previewUrl}
        />
      </div>

      {/* アップロード中テキスト */}
      <p className="font-bold text-text-br text-xl leading-7">
        {uploadingText(language)}
      </p>

      {/* プログレスバー */}
      <Progress
        aria-label={uploadingText(language)}
        classNames={{
          base: "w-[400px]",
          track: "h-7 bg-zinc-200",
          indicator: "bg-orange-400",
        }}
        showValueLabel={false}
        value={progress}
      />
    </div>
  );
}
