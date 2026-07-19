import type { Language } from "@/types/language";
import { assertNever } from "@/utils/assert-never";

interface LoginPageTexts {
  readonly failedMessage: string;
  readonly redirectingMessage: string;
  readonly retryButtonText: string;
}

export function loginPageTexts(language: Language): LoginPageTexts {
  switch (language) {
    case "ja":
      return {
        redirectingMessage: "GitHubへリダイレクトしています…",
        failedMessage:
          "ログインに失敗しました。時間をおいて再度お試しください。",
        retryButtonText: "再試行",
      };
    case "en":
      return {
        redirectingMessage: "Redirecting to GitHub…",
        failedMessage: "Login failed. Please try again later.",
        retryButtonText: "Retry",
      };
    default:
      return assertNever(language);
  }
}

interface LogoutPageTexts {
  readonly failedMessage: string;
  readonly loggingOutMessage: string;
  readonly retryButtonText: string;
}

export function logoutPageTexts(language: Language): LogoutPageTexts {
  switch (language) {
    case "ja":
      return {
        loggingOutMessage: "ログアウトしています…",
        failedMessage:
          "ログアウトに失敗しました。時間をおいて再度お試しください。",
        retryButtonText: "再試行",
      };
    case "en":
      return {
        loggingOutMessage: "Signing out…",
        failedMessage: "Sign out failed. Please try again later.",
        retryButtonText: "Retry",
      };
    default:
      return assertNever(language);
  }
}
