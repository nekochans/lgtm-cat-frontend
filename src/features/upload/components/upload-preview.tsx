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
} from "../upload-i18n";

type Props = {
  readonly language: Language;
  readonly previewUrl: string;
  readonly fileName: string;
  readonly onCancel: () => void;
  readonly onUpload: () => void;
  readonly isUploading?: boolean;
};

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
      <div className="relative h-[371px] w-[373px]">
        <Image
          alt={`Preview of ${fileName}`}
          className="object-contain"
          fill
          sizes="373px"
          src={previewUrl}
        />
      </div>

      {/* 確認テキスト */}
      <p className="font-bold text-text-br text-xl leading-7">
        {previewConfirmationText(language)}
      </p>

      {/* ボタン */}
      <div className="flex items-center justify-center gap-5">
        <Button
          className="h-12 w-[220px] rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover"
          isDisabled={isUploading}
          onPress={onCancel}
          variant="bordered"
        >
          {cancelButtonText(language)}
        </Button>
        <Button
          className="h-12 w-[220px] rounded-lg bg-button-primary-base px-6 font-bold text-base text-text-wh hover:bg-button-primary-hover"
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
