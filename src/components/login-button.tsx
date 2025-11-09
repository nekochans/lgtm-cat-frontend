// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";
import { IconButton } from "@/components/icon-button";
import type { Language } from "@/features/language";
import { createIncludeLanguageAppPath } from "@/features/url";

type Props = {
  language: Language;
};

export function LoginButton({ language }: Props): JSX.Element {
  return (
    <IconButton
      displayText={language === "en" ? "Login" : "ログイン"}
      // eslint-disable-next-line react/prefer-shorthand-boolean
      link={createIncludeLanguageAppPath("login", language)}
      showGithubIcon={true}
    />
  );
}
