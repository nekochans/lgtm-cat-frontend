import type { IncludeLanguageAppPath } from '@/features/url';
import { removeLanguageFromAppPath } from '@/features/language';
import { describe, expect, it } from 'vitest';

describe('src/features/language.ts removeLanguageFromAppPath TestCases', () => {
  type TestTable = {
    appPath: IncludeLanguageAppPath;
    expected: string;
  };

  it.each`
    appPath         | expected
    ${'/en'}        | ${'/'}
    ${'/ja'}        | ${'/'}
    ${'/en/upload'} | ${'/upload'}
    ${'/ja/upload'} | ${'/upload'}
    ${'/upload/en'} | ${'/upload'}
    ${'/upload/ja'} | ${'/upload'}
  `(
    'should return removed language path. appPath: $appPath',
    ({ appPath, expected }: TestTable) => {
      expect(removeLanguageFromAppPath(appPath)).toStrictEqual(expected);
    },
  );
});
