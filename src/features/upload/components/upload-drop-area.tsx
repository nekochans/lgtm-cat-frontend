// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { Button } from "@heroui/react";
import {
  type ChangeEvent,
  type DragEvent,
  type JSX,
  useCallback,
  useRef,
  useState,
} from "react";
import { UploadCloudIcon } from "@/components/icons/upload-cloud-icon";
import type { Language } from "@/features/language";
import {
  imageDropAreaText,
  uploadInputButtonText,
} from "../functions/upload-i18n";

type Props = {
  readonly language: Language;
  readonly onFileSelect: (file: File) => void;
  readonly isDisabled?: boolean;
};

/**
 * ドラッグ＆ドロップエリア
 * Figmaデザイン（node-id: 214:1093）に基づく
 */
export function UploadDropArea({
  language,
  onFileSelect,
  isDisabled = false,
}: Props): JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!isDisabled) {
        setIsDragOver(true);
      }
    },
    [isDisabled]
  );

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      if (isDisabled) {
        return;
      }

      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile != null) {
        onFileSelect(droppedFile);
      }
    },
    [isDisabled, onFileSelect]
  );

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile != null) {
        onFileSelect(selectedFile);
      }
      // ファイル選択をリセット（同じファイルを再選択できるように）
      if (fileInputRef.current != null) {
        fileInputRef.current.value = "";
      }
    },
    [onFileSelect]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Drag and drop area requires event handlers for file drop functionality
    // biome-ignore lint/a11y/useSemanticElements: No semantic element exists for drag-and-drop zones
    <div
      aria-label="Image drop area"
      className={`flex flex-col items-center justify-center gap-5 ${
        isDragOver ? "opacity-70" : ""
      }`}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="region"
    >
      <UploadCloudIcon />
      <p className="font-bold text-text-br text-xl leading-7">
        {imageDropAreaText(language)}
      </p>
      <Button
        className="h-12 w-[220px] rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover"
        isDisabled={isDisabled}
        onPress={handleButtonClick}
        variant="bordered"
      >
        {uploadInputButtonText(language)}
      </Button>
      <input
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFileInputChange}
        ref={fileInputRef}
        type="file"
      />
    </div>
  );
}
