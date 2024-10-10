import type { Language } from '@/features/language';
import { assertNever } from '@/utils/assertNever';

export function uploadText(language: Language): string {
  switch (language) {
    case 'ja':
      return 'アップロード';
    case 'en':
      return 'Upload new Cats';
    default:
      return assertNever(language);
  }
}

export function howToUseText(language: Language): string {
  switch (language) {
    case 'ja':
      return '使い方';
    case 'en':
      return 'How to Use';
    default:
      return assertNever(language);
  }
}

export function policyText(language: Language): string {
  switch (language) {
    case 'ja':
      return 'ポリシー';
    case 'en':
      return 'Policy';
    default:
      return assertNever(language);
  }
}

export function favoriteListText(language: Language): string {
  switch (language) {
    case 'ja':
      return 'お気に入り';
    case 'en':
      return 'Favorite';
    default:
      return assertNever(language);
  }
}

export function meowlistText(language: Language): string {
  switch (language) {
    case 'ja':
      return 'にゃんリスト';
    case 'en':
      return 'Meowlist';
    default:
      return assertNever(language);
  }
}

export function logoutText(language: Language): string {
  switch (language) {
    case 'ja':
      return 'ログアウト';
    case 'en':
      return 'Logout';
    default:
      return assertNever(language);
  }
}
