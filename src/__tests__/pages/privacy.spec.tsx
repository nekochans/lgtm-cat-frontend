/**
 * @jest-environment jsdom
 */
import fs from 'fs';

import { render } from '@testing-library/react';
import React from 'react';

import PrivacyPage from '../../pages/privacy';

test('PrivacyPage Snapshot test', async () => {
  const fsPromise = fs.promises;

  const privacy = await fsPromise.readFile(
    `${process.cwd()}/src/docs/privacy.md`,
    {
      encoding: 'utf8',
    },
  );

  const { asFragment } = render(<PrivacyPage privacy={privacy} />);
  expect(asFragment()).toMatchSnapshot();
});
