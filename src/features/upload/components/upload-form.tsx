// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LgtmCatIcon } from "@/components/lgtm-cat-icon";
import type { Language } from "@/features/language";
import type { LgtmImageUrl } from "@/features/main/types/lgtm-image";
import { uploadToR2 as defaultUploadToStorage } from "@/lib/cloudflare/r2/upload-to-r2";
import { sendUploadedCatImage } from "@/utils/gtm";
import { generateUploadUrlAction as defaultGenerateUploadUrlAction } from "../actions/generate-upload-url-action";
import { validateAndCreateLgtmImageAction as defaultValidateAndCreateLgtmImageAction } from "../actions/validate-and-create-lgtm-image-action";
import {
  createImageSizeTooLargeErrorMessage,
  createNotAllowedImageExtensionErrorMessage,
  errorMessageStorageUploadFailed,
  unexpectedErrorMessage,
} from "../functions/upload-i18n";
import { validateUploadFile } from "../functions/upload-validator";
import type {
  GenerateUploadUrlAction,
  UploadFormState,
  UploadToStorageFunc,
  UploadValidationResult,
  ValidateAndCreateLgtmImageAction,
} from "../types/upload";
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
  /**
   * 依存関係の注入（Storybook等でのモック用）
   * 省略時は実際のServer Actions/関数が使用される
   */
  readonly generateUploadUrlAction?: GenerateUploadUrlAction;
  /**
   * ストレージへのアップロード関数（Storybook等でのモック用）
   *
   * 注: TS71007警告が出るが、この関数はServer Actionではなく
   * クライアントサイドで実行される通常の関数のため、
   * "Action" サフィックスは付けない。警告は意図的に無視する。
   */
  readonly uploadToStorage?: UploadToStorageFunc;
  readonly validateAndCreateLgtmImageAction?: ValidateAndCreateLgtmImageAction;
  /**
   * 初期状態の設定（Storybook用）
   * 実際の使用時は指定不要
   */
  readonly initialState?: UploadFormState;
  readonly initialPreviewUrl?: string | null;
  readonly initialSelectedFile?: File | null;
  readonly initialLgtmImageUrl?: LgtmImageUrl | null;
  readonly initialPreviewImageUrlForSuccess?: string | null;
  readonly initialErrorMessages?: readonly string[];
  readonly initialUploadProgress?: number;
};

/**
 * アップロードフォームメインコンポーネント
 * Figmaデザイン（node-id: 214:1070）に基づく
 */
export function UploadForm({
  language,
  generateUploadUrlAction = defaultGenerateUploadUrlAction,
  uploadToStorage = defaultUploadToStorage,
  validateAndCreateLgtmImageAction = defaultValidateAndCreateLgtmImageAction,
  initialState = "idle",
  initialPreviewUrl = null,
  initialSelectedFile = null,
  initialLgtmImageUrl = null,
  initialPreviewImageUrlForSuccess = null,
  initialErrorMessages = [],
  initialUploadProgress = 0,
}: Props): JSX.Element {
  const [formState, setFormState] = useState<UploadFormState>(initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(
    initialSelectedFile
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl
  );
  const [lgtmImageUrl, setLgtmImageUrl] = useState<LgtmImageUrl | null>(
    initialLgtmImageUrl
  );
  const [previewImageUrlForSuccess, setPreviewImageUrlForSuccess] = useState<
    string | null
  >(initialPreviewImageUrlForSuccess);
  const [errorMessages, setErrorMessages] =
    useState<readonly string[]>(initialErrorMessages);
  const [uploadProgress, setUploadProgress] = useState(initialUploadProgress);

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
      const urlResult = await generateUploadUrlAction(
        selectedFile.type,
        selectedFile.size,
        language
      );

      if (!urlResult.success) {
        setErrorMessages(urlResult.errorMessages);
        setFormState("error");
        return;
      }

      // Step 2: ブラウザからストレージへ直接アップロード（プログレス: 30-60%）
      progressManager.stop();
      progressManager.setProgress(30);
      progressManager.start(10, 60, 300);

      const uploadResult = await uploadToStorage(
        selectedFile,
        urlResult.presignedPutUrl
      );

      if (!uploadResult.success) {
        setErrorMessages([errorMessageStorageUploadFailed(language)]);
        setFormState("error");
        return;
      }

      // Step 3: 猫画像判定とLGTM画像作成（プログレス: 60-90%）
      progressManager.stop();
      progressManager.setProgress(60);
      progressManager.start(10, 90, 500);

      const result = await validateAndCreateLgtmImageAction(
        urlResult.objectKey,
        language
      );

      progressManager.setProgress(100);

      if (result.success) {
        // GAイベント送信: 画像アップロード成功時
        sendUploadedCatImage();

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
  }, [
    selectedFile,
    previewUrl,
    language,
    progressManager,
    generateUploadUrlAction,
    uploadToStorage,
    validateAndCreateLgtmImageAction,
  ]);

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
        className={`flex min-h-[360px] flex-col items-center justify-center gap-2.5 rounded-2xl border-[5px] border-dashed p-4 md:min-h-[600px] md:gap-[10px] md:p-7 ${
          formState === "error" ? "border-rose-400" : "border-primary"
        }`}
      >
        {/* エラー表示 */}
        {formState === "error" && errorMessages.length > 0 && (
          <div className="mb-4 w-full max-w-full px-2 md:max-w-[500px] md:px-0">
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

      {/* ねこイラスト（右下）
          モバイル: idle状態のみ表示（ボタンとの重なり回避）
          デスクトップ: 成功画面以外で表示 */}
      {formState === "idle" && (
        <div className="pointer-events-none absolute right-4 bottom-4 md:hidden">
          <LgtmCatIcon
            aria-hidden
            className="rotate-12"
            height={80}
            width={100}
          />
        </div>
      )}
      {formState !== "success" && (
        <div className="pointer-events-none absolute right-4 bottom-4 hidden md:block">
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
