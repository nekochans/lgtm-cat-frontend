/**
 * @jest-environment jsdom
 */
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from '@testing-library/react';
import fs from 'fs';
import TermsPage from '../terms';

test('TermsPage Snapshot test', async () => {
  const fsPromise = fs.promises;

  const terms = await fsPromise.readFile(`${process.cwd()}/src/docs/terms.md`, {
    encoding: 'utf8',
  });

  const { asFragment } = render(<TermsPage terms={terms} />);
  expect(asFragment()).toMatchSnapshot();
});
