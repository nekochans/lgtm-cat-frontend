import { mightExtractLanguageFromUrlPath, type Language } from '@/features';
import { describe, expect, it } from 'vitest';

describe('src/features/language.ts mightExtractLanguageFromUrlPath TestCases', () => {
  type TestTable = {
    urlPath: string;
    expected: Language | null;
  };

  it.each`
    urlPath         | expected
    ${'/en'}        | ${'en'}
    ${'/ja'}        | ${'ja'}
    ${'/en/upload'} | ${'en'}
    ${'/ja/upload'} | ${'ja'}
    ${'/upload/en'} | ${'en'}
    ${'/upload/ja'} | ${'ja'}
    ${'en/terms'}   | ${null}
  `(
    'should return language. urlPath: $urlPath',
    ({ urlPath, expected }: TestTable) => {
      expect(mightExtractLanguageFromUrlPath(urlPath)).toStrictEqual(expected);
    },
  );
});
