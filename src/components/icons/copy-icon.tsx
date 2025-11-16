// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";

type Props = {
  width?: number;
  height?: number;
  color?: "default" | "white";
};

export function CopyIcon({
  width = 20,
  height = 20,
  color = "default",
}: Props): JSX.Element {
  const fillColor = color === "default" ? "#CBD5E1" : "#FFFFFF";

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={height}
      viewBox="0 0 20 20"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Copy icon</title>
      <path
        d="M10 1.66666H3.33333C2.41667 1.66666 1.66667 2.41666 1.66667 3.33332V13.3333H3.33333V3.33332H10V1.66666ZM12.5 4.99999H6.66667C5.75 4.99999 5 5.74999 5 6.66666V16.6667C5 17.5833 5.75 18.3333 6.66667 18.3333H12.5C13.4167 18.3333 14.1667 17.5833 14.1667 16.6667V6.66666C14.1667 5.74999 13.4167 4.99999 12.5 4.99999ZM12.5 16.6667H6.66667V6.66666H12.5V16.6667Z"
        fill={fillColor}
      />
    </svg>
  );
}
