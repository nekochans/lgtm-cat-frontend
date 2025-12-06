// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { JSX } from "react";

type Props = {
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
};

/**
 * アップロード用クラウドアイコン
 * Figmaデザイン（node-id: 214:1108）に基づく
 */
export function UploadCloudIcon({
  width = 69,
  height = 49,
  className,
}: Props): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={height}
      viewBox="0 0 69 49"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Upload cloud icon</title>
      {/* クラウド部分 */}
      <path
        d="M55.775 19.875C56.35 9.2 47.725 0.5 37.05 0.5C28.425 0.5 21.175 6.375 18.65 14.425C18.075 14.35 17.5 14.275 16.925 14.275C8.3 14.275 1.25 21.325 1.25 29.95C1.25 38.575 8.3 45.625 16.925 45.625H52.025C60.075 45.625 66.525 39.175 66.525 31.125C66.525 23.65 60.95 17.5 53.775 16.625C54.625 17.575 55.25 18.675 55.775 19.875Z"
        fill="#FB923C"
      />
      {/* 上矢印 */}
      <path
        d="M34.5 35V21M34.5 21L27 28.5M34.5 21L42 28.5"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  );
}
