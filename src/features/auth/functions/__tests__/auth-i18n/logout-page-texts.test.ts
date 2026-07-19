import { describe, expect, it } from "vitest";
import { logoutPageTexts } from "@/features/auth/functions/auth-i18n";
import type { Language } from "@/types/language";

describe("src/features/auth/functions/auth-i18n.ts logoutPageTexts TestCases", () => {
  interface TestTable {
    readonly expectedFailedMessage: string;
    readonly expectedLoggingOutMessage: string;
    readonly expectedRetryButtonText: string;
    readonly language: Language;
  }

  it.each`
    language | expectedLoggingOutMessage  | expectedFailedMessage                                           | expectedRetryButtonText
    ${"ja"}  | ${"ログアウトしています…"} | ${"ログアウトに失敗しました。時間をおいて再度お試しください。"} | ${"再試行"}
    ${"en"}  | ${"Signing out…"}          | ${"Sign out failed. Please try again later."}                   | ${"Retry"}
  `(
    "should return $language logout page texts",
    ({
      language,
      expectedLoggingOutMessage,
      expectedFailedMessage,
      expectedRetryButtonText,
    }: TestTable) => {
      expect(logoutPageTexts(language)).toStrictEqual({
        loggingOutMessage: expectedLoggingOutMessage,
        failedMessage: expectedFailedMessage,
        retryButtonText: expectedRetryButtonText,
      });
    }
  );
});
