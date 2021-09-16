/**
 * @jest-environment jsdom
 */
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from '@testing-library/react';
import fs from 'fs';
import PrivacyPage from '../privacy';

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
