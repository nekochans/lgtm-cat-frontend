// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useState } from "react";
import { LgtmCatIcon } from "@/components/lgtm-cat-icon";
import type { Language } from "@/features/language";
import { mockUpload } from "../functions/mock-upload";
import type { UploadFormState, UploadValidationResult } from "../types/upload";
import {
  createImageSizeTooLargeErrorMessage,
  createNotAllowedImageExtensionErrorMessage,
  unexpectedErrorMessage,
} from "../upload-i18n";
import { validateUploadFile } from "../upload-validator";
import { UploadDropArea } from "./upload-drop-area";
import { UploadErrorMessage } from "./upload-error-message";
import { UploadNotes } from "./upload-notes";
import { UploadPreview } from "./upload-preview";
import { UploadProgress } from "./upload-progress";
import { UploadSuccess } from "./upload-success";

type Props = {
  readonly language: Language;
};

/**
 * アップロードフォームメインコンポーネント
 * Figmaデザイン（node-id: 214:1070）に基づく
 */
export function UploadForm({ language }: Props): JSX.Element {
  const [formState, setFormState] = useState<UploadFormState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<readonly string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // プレビューURLのクリーンアップ
  useEffect(
    () => () => {
      if (previewUrl != null) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      // バリデーション
      const validationResult: UploadValidationResult = validateUploadFile(file);

      if (!validationResult.isValid) {
        let messages: readonly string[];

        switch (validationResult.errorType) {
          case "invalid_extension":
            messages = createNotAllowedImageExtensionErrorMessage(
              validationResult.fileType ?? "unknown",
              language
            );
            break;
          case "file_too_large":
            messages = createImageSizeTooLargeErrorMessage(language);
            break;
          default:
            messages = unexpectedErrorMessage(language);
        }

        setErrorMessages(messages);
        setFormState("error");
        return;
      }

      // プレビューURL作成
      const objectUrl = URL.createObjectURL(file);

      // 古いプレビューURLをクリーンアップ
      if (previewUrl != null) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setErrorMessages([]);
      setFormState("preview");
    },
    [language, previewUrl]
  );

  const handleCancel = useCallback(() => {
    if (previewUrl != null) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setErrorMessages([]);
    setUploadProgress(0);
    setFormState("idle");
  }, [previewUrl]);

  const handleUpload = useCallback(async () => {
    if (selectedFile == null || previewUrl == null) {
      return;
    }

    setFormState("uploading");
    setUploadProgress(0);

    const result = await mockUpload(selectedFile, previewUrl, (progress) => {
      setUploadProgress(progress);
    });

    if (result.success) {
      setUploadedImageUrl(result.imageUrl);
      setFormState("success");
    } else {
      setErrorMessages(unexpectedErrorMessage(language));
      setFormState("error");
    }
  }, [selectedFile, previewUrl, language]);

  const handleErrorDismiss = useCallback(() => {
    setErrorMessages([]);
    setFormState("idle");
  }, []);

  const handleSuccessClose = useCallback(() => {
    if (previewUrl != null) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setErrorMessages([]);
    setUploadProgress(0);
    setFormState("idle");
  }, [previewUrl]);

  return (
    <div className="relative overflow-hidden rounded-2xl border-[6px] border-white border-solid bg-white">
      {/* メインコンテンツエリア */}
      <div
        className={`flex min-h-[600px] flex-col items-center justify-center gap-[10px] rounded-2xl border-[5px] border-dashed p-7 ${
          formState === "error" ? "border-rose-400" : "border-primary"
        }`}
      >
        {/* エラー表示 */}
        {formState === "error" && errorMessages.length > 0 && (
          <div className="mb-4 w-full max-w-[500px]">
            <UploadErrorMessage messages={errorMessages} />
            <button
              className="mt-2 text-sm text-text-br underline hover:no-underline"
              onClick={handleErrorDismiss}
              type="button"
            >
              {language === "ja" ? "閉じる" : "Close"}
            </button>
          </div>
        )}

        {/* ドロップエリア（初期状態・エラー状態） */}
        {(formState === "idle" || formState === "error") && (
          <>
            <UploadDropArea
              isDisabled={false}
              language={language}
              onFileSelect={handleFileSelect}
            />
            <UploadNotes language={language} />
          </>
        )}

        {/* プレビュー表示 */}
        {formState === "preview" &&
          previewUrl != null &&
          selectedFile != null && (
            <UploadPreview
              fileName={selectedFile.name}
              isUploading={false}
              language={language}
              onCancel={handleCancel}
              onUpload={handleUpload}
              previewUrl={previewUrl}
            />
          )}

        {/* アップロード中 */}
        {formState === "uploading" &&
          previewUrl != null &&
          selectedFile != null && (
            <UploadProgress
              fileName={selectedFile.name}
              language={language}
              previewUrl={previewUrl}
              progress={uploadProgress}
            />
          )}

        {/* アップロード成功 */}
        {formState === "success" && uploadedImageUrl != null && (
          <UploadSuccess
            imageUrl={uploadedImageUrl}
            language={language}
            onClose={handleSuccessClose}
          />
        )}
      </div>

      {/* ねこイラスト（右下） - 成功画面以外で表示 */}
      {formState !== "success" && (
        <div className="pointer-events-none absolute right-4 bottom-4">
          <LgtmCatIcon
            aria-hidden
            className="rotate-12"
            height={80}
            width={100}
          />
        </div>
      )}
    </div>
  );
}
