// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { ProgressBar } from "@heroui/react";
import Image from "next/image";
import type { JSX } from "react";
import type { Language } from "@/types/language";
import { uploadingText } from "../functions/upload-i18n";

interface Props {
  readonly fileName: string;
  readonly language: Language;
  readonly previewUrl: string;
  readonly progress: number;
}

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
      <div className="relative h-[280px] w-[280px] md:h-[371px] md:w-[371px]">
        <Image
          alt={`Uploading ${fileName}`}
          className="object-contain"
          fill
          sizes="(max-width: 768px) 280px, 371px"
          src={previewUrl}
        />
      </div>

      {/* アップロード中テキスト */}
      <p className="font-bold text-base text-text-br leading-6 md:text-xl md:leading-7">
        {uploadingText(language)}
      </p>

      {/* プログレスバー */}
      <ProgressBar
        aria-label={uploadingText(language)}
        className="w-full max-w-[280px] md:max-w-[400px]"
        value={progress}
      >
        <ProgressBar.Track className="h-6 bg-zinc-200 md:h-7">
          <ProgressBar.Fill className="bg-orange-400" />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}
