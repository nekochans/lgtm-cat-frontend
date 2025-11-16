// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";

type Props = {
  width?: number;
  height?: number;
  color?: "default" | "active";
};

export function CopyIcon({
  width = 20,
  height = 20,
  color = "default",
}: Props): JSX.Element {
  const palette =
    color === "active"
      ? { stroke: "#3C4F64", fill: "#8FB6FF" }
      : { stroke: "#CBD5E1", fill: "#FFFFFF" };

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
      <rect
        fill={palette.fill}
        height="11"
        rx="2.2"
        stroke={palette.stroke}
        strokeWidth="1.4"
        width="9.8"
        x="7"
        y="6"
      />
      <rect
        fill="white"
        height="11.5"
        rx="2.4"
        stroke={palette.stroke}
        strokeWidth="1.4"
        width="10.4"
        x="2.6"
        y="2.6"
      />
    </svg>
  );
}
