import {
  type IncludeLanguageAppPath,
  mightExtractLanguageFromAppPath,
  type Language,
} from '@/features';
import { describe, expect, it } from 'vitest';

describe('src/features/language.ts mightExtractLanguageFromAppPath TestCases', () => {
  type TestTable = {
    appPath: IncludeLanguageAppPath;
    expected: Language | null;
  };

  it.each`
    appPath         | expected
    ${'/en'}        | ${'en'}
    ${'/ja'}        | ${'ja'}
    ${'/en/upload'} | ${'en'}
    ${'/ja/upload'} | ${'ja'}
    ${'/upload/en'} | ${'en'}
    ${'/upload/ja'} | ${'ja'}
    ${'en/terms'}   | ${null}
  `(
    'should return language. appPath: $appPath',
    ({ appPath, expected }: TestTable) => {
      expect(mightExtractLanguageFromAppPath(appPath)).toStrictEqual(expected);
    },
  );
});
