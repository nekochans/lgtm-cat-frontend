// 絶対厳守：編集前に必ずAI実装ルールを読む
import { Button } from "@heroui/react";
import Link from "next/link";
import type { CSSProperties, JSX } from "react";
import type { IncludeLanguageAppPath, Url } from "@/features/url";

type Props = {
  linkText: string;
  linkUrl: Url | IncludeLanguageAppPath;
  className?: string;
  style?: CSSProperties;
};

export function LinkButton({
  linkText,
  linkUrl,
  className,
  style,
}: Props): JSX.Element {
  return (
    <Button
      as={Link}
      className={`flex w-full max-w-screen-md items-center justify-center gap-2.5 rounded-lg bg-button-tertiary-tx px-6 py-3.5 font-bold font-inter text-lg text-text-wh transition-colors duration-200 hover:bg-button-primary-active ${className ?? ""}`}
      href={linkUrl}
      style={style}
    >
      {linkText}
    </Button>
  );
}
