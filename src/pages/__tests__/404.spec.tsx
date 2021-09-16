/**
 * @jest-environment jsdom
 */
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from '@testing-library/react';
import Custom404 from '../404';

test('Custom404 Snapshot test', () => {
  const { asFragment } = render(<Custom404 />);
  expect(asFragment()).toMatchSnapshot();
});
