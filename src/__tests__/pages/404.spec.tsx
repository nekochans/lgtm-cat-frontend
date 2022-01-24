/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import React from 'react';

import Custom404 from '../../pages/404';

test('Custom404 Snapshot test', () => {
  const { asFragment } = render(<Custom404 />);
  expect(asFragment()).toMatchSnapshot();
});
