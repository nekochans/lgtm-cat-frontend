// 絶対厳守：編集前に必ずAI実装ルールを読む
import Link from "next/link";
import type { JSX } from "react";
import { Text } from "react-aria-components";
import { LgtmCatIcon } from "@/components/lgtm-cat-icon";
import type { Language } from "@/features/language";
import { createIncludeLanguageAppPath } from "@/features/url";

export interface Props {
  readonly language: Language;
  readonly size?: "desktop" | "mobile";
}

export function HeaderLogo({ language, size = "desktop" }: Props): JSX.Element {
  const homeToLink = createIncludeLanguageAppPath("home", language);

  const sizeClasses = size === "mobile" ? "h-8 w-[146px]" : "h-10 w-[218px]";

  const textClasses = size === "mobile" ? "text-2xl" : "text-4xl";

  const iconSize =
    size === "mobile" ? { width: 28, height: 21 } : { width: 36, height: 27 };

  return (
    <Link
      className={`flex items-center justify-center gap-0.5 bg-orange-500 ${sizeClasses}`}
      href={homeToLink}
      prefetch={false}
    >
      {/* eslint-disable-next-line react/prefer-shorthand-boolean */}
      <LgtmCatIcon
        aria-hidden={true}
        className="shrink-0"
        height={iconSize.height}
        width={iconSize.width}
      />
      <h1
        className={`font-bold text-orange-50 no-underline ${textClasses}`}
        style={{ fontFamily: "var(--font-m-plus-rounded-1c)" }}
      >
        <Text>LGTMeow</Text>
      </h1>
    </Link>
  );
}
