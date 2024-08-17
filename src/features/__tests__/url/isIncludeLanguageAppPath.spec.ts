import { isIncludeLanguageAppPath } from '@/features/url';
import { describe, expect, it } from 'vitest';

describe('src/features/url.ts isIncludeLanguageAppPath TestCases', () => {
  type TestTable = {
    value: unknown;
    expected: boolean;
  };

  it.each`
    value            | expected
    ${'/'}           | ${true}
    ${'/en'}         | ${true}
    ${'/ja'}         | ${true}
    ${'/en/upload'}  | ${true}
    ${'/ja/upload'}  | ${true}
    ${'/terms'}      | ${true}
    ${'/ja/terms'}   | ${true}
    ${'/en/terms'}   | ${true}
    ${'/privacy'}    | ${true}
    ${'/ja/privacy'} | ${true}
    ${'/en/privacy'} | ${true}
    ${'/bn/upload'}  | ${false}
    ${'/upload/ja'}  | ${false}
  `(
    'should return the intended result. value: $value',
    ({ value, expected }: TestTable) => {
      expect(isIncludeLanguageAppPath(value)).toStrictEqual(expected);
    },
  );
});
