// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";

type Props = {
  width?: number;
  height?: number;
  color?: "default" | "favorite";
};

export function HeartIcon({
  width = 20,
  height = 20,
  color = "default",
}: Props): JSX.Element {
  const fillColor = color === "default" ? "#CBD5E1" : "#EF4444";

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={height}
      viewBox="0 0 20 20"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Heart icon</title>
      <path
        d="M10 17.5L8.825 16.4583C4.5 12.5833 1.66667 10.0417 1.66667 7C1.66667 4.45834 3.625 2.5 6.16667 2.5C7.58333 2.5 8.94167 3.13334 10 4.09167C11.0583 3.13334 12.4167 2.5 13.8333 2.5C16.375 2.5 18.3333 4.45834 18.3333 7C18.3333 10.0417 15.5 12.5833 11.175 16.4583L10 17.5Z"
        fill={fillColor}
      />
    </svg>
  );
}
