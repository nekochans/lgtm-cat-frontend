import { describe, expect, it } from "vitest";
import { loginPageTexts } from "@/features/auth/functions/auth-i18n";
import type { Language } from "@/types/language";

describe("src/features/auth/functions/auth-i18n.ts loginPageTexts TestCases", () => {
  interface TestTable {
    readonly expectedFailedMessage: string;
    readonly expectedRedirectingMessage: string;
    readonly expectedRetryButtonText: string;
    readonly language: Language;
  }

  it.each`
    language | expectedRedirectingMessage           | expectedFailedMessage                                         | expectedRetryButtonText
    ${"ja"}  | ${"GitHubへリダイレクトしています…"} | ${"ログインに失敗しました。時間をおいて再度お試しください。"} | ${"再試行"}
    ${"en"}  | ${"Redirecting to GitHub…"}          | ${"Login failed. Please try again later."}                    | ${"Retry"}
  `(
    "should return $language login page texts",
    ({
      language,
      expectedRedirectingMessage,
      expectedFailedMessage,
      expectedRetryButtonText,
    }: TestTable) => {
      expect(loginPageTexts(language)).toStrictEqual({
        redirectingMessage: expectedRedirectingMessage,
        failedMessage: expectedFailedMessage,
        retryButtonText: expectedRetryButtonText,
      });
    }
  );
});
