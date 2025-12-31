// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Language } from "@/features/language";
import { assertNever } from "@/utils/assert-never";

export function uploadText(language: Language): string {
  switch (language) {
    case "ja":
      return "アップロード";
    case "en":
      return "Upload new Cats";
    default:
      return assertNever(language);
  }
}

export function howToUseText(language: Language): string {
  switch (language) {
    case "ja":
      return "使い方";
    case "en":
      return "How to Use";
    default:
      return assertNever(language);
  }
}

export function policyText(language: Language): string {
  switch (language) {
    case "ja":
      return "ポリシー";
    case "en":
      return "Policy";
    default:
      return assertNever(language);
  }
}

export function favoriteListText(language: Language): string {
  switch (language) {
    case "ja":
      return "お気に入り";
    case "en":
      return "Favorite";
    default:
      return assertNever(language);
  }
}

export function meowlistText(language: Language): string {
  switch (language) {
    case "ja":
      return "にゃんリスト";
    case "en":
      return "Meowlist";
    default:
      return assertNever(language);
  }
}

export function logoutText(language: Language): string {
  switch (language) {
    case "ja":
      return "ログアウト";
    case "en":
      return "Logout";
    default:
      return assertNever(language);
  }
}

export function homeText(language: Language): string {
  switch (language) {
    case "ja":
      return "HOME";
    case "en":
      return "HOME";
    default:
      return assertNever(language);
  }
}

export function loginText(language: Language): string {
  switch (language) {
    case "ja":
      return "ログイン";
    case "en":
      return "Login";
    default:
      return assertNever(language);
  }
}

export function switchLanguageAriaLabel(language: Language): string {
  switch (language) {
    case "ja":
      return "言語切替";
    case "en":
      return "Switch language";
    default:
      return assertNever(language);
  }
}

export function documentsText(language: Language): string {
  switch (language) {
    case "ja":
      return "ドキュメント";
    case "en":
      return "Documents";
    default:
      return assertNever(language);
  }
}

export function mcpText(language: Language): string {
  switch (language) {
    case "ja":
      return "MCPの使い方";
    case "en":
      return "How to Use MCP";
    default:
      return assertNever(language);
  }
}

export function openMenuAriaLabel(language: Language): string {
  switch (language) {
    case "ja":
      return "メニューを開く";
    case "en":
      return "Open menu";
    default:
      return assertNever(language);
  }
}

export function closeMenuAriaLabel(language: Language): string {
  switch (language) {
    case "ja":
      return "メニューを閉じる";
    case "en":
      return "Close menu";
    default:
      return assertNever(language);
  }
}
