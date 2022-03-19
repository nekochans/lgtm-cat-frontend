/**
 * @jest-environment jsdom
 */
import fs from 'fs';

import { render } from '@testing-library/react';
import React from 'react';

import TermsPage from '../../pages/terms';

test('TermsPage Snapshot test', async () => {
  const fsPromise = fs.promises;

  const terms = await fsPromise.readFile(`${process.cwd()}/src/docs/terms.md`, {
    encoding: 'utf8',
  });

  const { asFragment } = render(<TermsPage terms={terms} />);
  expect(asFragment()).toMatchSnapshot();
});
