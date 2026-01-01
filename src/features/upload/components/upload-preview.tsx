// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { Button } from "@heroui/react";
import Image from "next/image";
import type { JSX } from "react";
import type { Language } from "@/features/language";
import {
  cancelButtonText,
  previewConfirmationText,
  uploadButtonText,
} from "../functions/upload-i18n";

interface Props {
  readonly language: Language;
  readonly previewUrl: string;
  readonly fileName: string;
  readonly onCancel: () => void;
  readonly onUpload: () => void;
  readonly isUploading?: boolean;
}

/**
 * 画像プレビュー表示
 * Figmaデザイン（node-id: 260:6292）に基づく
 */
export function UploadPreview({
  language,
  previewUrl,
  fileName,
  onCancel,
  onUpload,
  isUploading = false,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      {/* プレビュー画像 */}
      <div className="relative h-[280px] w-[280px] md:h-[371px] md:w-[371px]">
        <Image
          alt={`Preview of ${fileName}`}
          className="object-contain"
          fill
          sizes="(max-width: 768px) 280px, 371px"
          src={previewUrl}
        />
      </div>

      {/* 確認テキスト */}
      <p className="px-2 text-center font-bold text-base text-text-br leading-6 md:px-0 md:text-xl md:leading-7">
        {previewConfirmationText(language)}
      </p>

      {/* ボタン */}
      <div className="flex w-full flex-col items-center justify-center gap-3 px-4 md:w-auto md:flex-row md:gap-5 md:px-0">
        <Button
          className="h-12 w-full rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover md:w-[220px]"
          isDisabled={isUploading}
          onPress={onCancel}
          variant="bordered"
        >
          {cancelButtonText(language)}
        </Button>
        <Button
          className="h-12 w-full rounded-lg bg-button-primary-base px-6 font-bold text-base text-text-wh hover:bg-button-primary-hover md:w-[220px]"
          isDisabled={isUploading}
          isLoading={isUploading}
          onPress={onUpload}
        >
          {uploadButtonText(language)}
        </Button>
      </div>
    </div>
  );
}
