// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LgtmCatIcon } from "@/components/lgtm-cat-icon";
import type { Language } from "@/features/language";
import { generateUploadUrl } from "../actions/generate-upload-url";
import { validateAndCreateLgtmImage } from "../actions/validate-and-create-lgtm-image";
import { uploadToR2 } from "../functions/upload-to-r2";
import type { UploadFormState, UploadValidationResult } from "../types/upload";
import {
  createImageSizeTooLargeErrorMessage,
  createNotAllowedImageExtensionErrorMessage,
  errorMessageR2UploadFailed,
  unexpectedErrorMessage,
} from "../upload-i18n";
import { validateUploadFile } from "../upload-validator";
import { UploadDropArea } from "./upload-drop-area";
import { UploadErrorMessage } from "./upload-error-message";
import { UploadNotes } from "./upload-notes";
import { UploadPreview } from "./upload-preview";
import { UploadProgress } from "./upload-progress";
import { UploadSuccess } from "./upload-success";

/**
 * プログレス管理用のヘルパー型
 */
type ProgressManager = {
  readonly start: (increment: number, max: number, intervalMs: number) => void;
  readonly stop: () => void;
  readonly setProgress: (value: number) => void;
};

/**
 * プログレス管理ヘルパーを作成
 */
function createProgressManager(
  setUploadProgress: (updater: (prev: number) => number) => void,
  intervalRef: React.RefObject<ReturnType<typeof setInterval> | null>
): ProgressManager {
  return {
    start: (increment: number, max: number, intervalMs: number) => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + increment, max));
      }, intervalMs);
    },
    stop: () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    setProgress: (value: number) => {
      setUploadProgress(() => value);
    },
  };
}

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
  const [lgtmImageUrl, setLgtmImageUrl] = useState<string | null>(null);
  const [previewImageUrlForSuccess, setPreviewImageUrlForSuccess] = useState<
    string | null
  >(null);
  const [errorMessages, setErrorMessages] = useState<readonly string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // プログレスインターバル管理用のref
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const progressManager = useMemo(
    () => createProgressManager(setUploadProgress, progressIntervalRef),
    []
  );

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
    setLgtmImageUrl(null);
    setPreviewImageUrlForSuccess(null);
    setErrorMessages([]);
    setUploadProgress(0);
    setFormState("idle");
  }, [previewUrl]);

  const handleUpload = useCallback(async () => {
    if (selectedFile == null || previewUrl == null) {
      return;
    }

    setFormState("uploading");
    progressManager.setProgress(0);

    try {
      // Step 1: 署名付きPUT URLを取得（プログレス: 0-30%）
      progressManager.start(5, 30, 200);
      const urlResult = await generateUploadUrl(
        selectedFile.type,
        selectedFile.size,
        language
      );

      if (!urlResult.success) {
        setErrorMessages(urlResult.errorMessages);
        setFormState("error");
        return;
      }

      // Step 2: ブラウザからR2へ直接アップロード（プログレス: 30-60%）
      progressManager.stop();
      progressManager.setProgress(30);
      progressManager.start(10, 60, 300);

      const uploadResult = await uploadToR2(
        selectedFile,
        urlResult.presignedPutUrl
      );

      if (!uploadResult.success) {
        setErrorMessages([errorMessageR2UploadFailed(language)]);
        setFormState("error");
        return;
      }

      // Step 3: 猫画像判定とLGTM画像作成（プログレス: 60-90%）
      progressManager.stop();
      progressManager.setProgress(60);
      progressManager.start(10, 90, 500);

      const result = await validateAndCreateLgtmImage(
        urlResult.objectKey,
        language
      );

      progressManager.setProgress(100);

      if (result.success) {
        setLgtmImageUrl(result.createdLgtmImageUrl);
        setPreviewImageUrlForSuccess(result.previewImageUrl);
        setFormState("success");
      } else {
        setErrorMessages(result.errorMessages);
        setFormState("error");
      }
    } catch {
      setErrorMessages(unexpectedErrorMessage(language));
      setFormState("error");
    } finally {
      progressManager.stop();
    }
  }, [selectedFile, previewUrl, language, progressManager]);

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
    setLgtmImageUrl(null);
    setPreviewImageUrlForSuccess(null);
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
        {formState === "success" &&
          lgtmImageUrl != null &&
          previewImageUrlForSuccess != null && (
            <UploadSuccess
              language={language}
              lgtmImageUrl={lgtmImageUrl}
              onClose={handleSuccessClose}
              previewImageUrl={previewImageUrlForSuccess}
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
