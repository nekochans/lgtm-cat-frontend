// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import type { JSX, ReactNode } from "react";
import { LinkButton } from "@/components/link-button";
import type { Language } from "@/features/language";
import { createIncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly title: string;
  readonly message: string;
  readonly buttonText: string;
  readonly catComponent: ReactNode;
}

export function ErrorPageContent({
  language,
  title,
  message,
  buttonText,
  catComponent,
}: Props): JSX.Element {
  const homeUrl = createIncludeLanguageAppPath("home", language);

  return (
    // Figma仕様: モバイル px-7(28px) py-10(40px) gap-7(28px)
    // Figma仕様: デスクトップ px-10(40px) py-[60px] gap-12(48px)
    <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:gap-12 md:px-10 md:py-[60px]">
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <h1 className="text-center font-bold text-2xl text-orange-900 md:text-4xl">
          {title}
        </h1>
        <p className="text-center text-amber-900 text-base md:text-xl">
          {message}
        </p>
      </div>
      {/* ねこイラストは装飾的要素のため、catComponentでaria-hidden="true"を設定 */}
      <div className="flex items-center justify-center">{catComponent}</div>
      {/* Figma仕様: ボタン幅 モバイル300px / デスクトップ400px */}
      <LinkButton
        className="w-full max-w-[300px] md:max-w-[400px]"
        linkText={buttonText}
        linkUrl={homeUrl}
      />
    </div>
  );
}
