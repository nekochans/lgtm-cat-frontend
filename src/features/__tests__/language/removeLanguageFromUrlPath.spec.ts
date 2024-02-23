import {
  removeLanguageFromUrlPath,
  type IncludeLanguageAppPath,
} from '@/features';
import { describe, expect, it } from 'vitest';

describe('src/features/language.ts removeLanguageFromUrlPath TestCases', () => {
  type TestTable = {
    urlPath: IncludeLanguageAppPath;
    expected: string;
  };

  it.each`
    urlPath         | expected
    ${'/en'}        | ${'/'}
    ${'/ja'}        | ${'/'}
    ${'/en/upload'} | ${'/upload'}
    ${'/ja/upload'} | ${'/upload'}
    ${'/upload/en'} | ${'/upload'}
    ${'/upload/ja'} | ${'/upload'}
  `(
    'should return removed language path. urlPath: $urlPath',
    ({ urlPath, expected }: TestTable) => {
      expect(removeLanguageFromUrlPath(urlPath)).toStrictEqual(expected);
    },
  );
});
