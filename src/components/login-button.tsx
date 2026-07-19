import type { JSX } from "react";
import { IconButton } from "@/components/icon-button";
import { createLoginAppPath } from "@/functions/auth";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly language: Language;
}

export function LoginButton({ currentUrlPath, language }: Props): JSX.Element {
  return (
    <IconButton
      displayText={language === "en" ? "Login" : "ログイン"}
      // eslint-disable-next-line react/prefer-shorthand-boolean
      link={createLoginAppPath(language, { returnTo: currentUrlPath })}
      showGithubIcon={true}
    />
  );
}
