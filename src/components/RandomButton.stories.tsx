import React from 'react';

import RandomButton from './RandomButton';

export default {
  title: 'src/components/RandomButton.tsx',
  component: RandomButton,
  includeStories: ['showRandomButtonWithProps'],
};

export const testProps = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleRandom: (): void => {},
};

export const showRandomButtonWithProps = (): JSX.Element => (
  <RandomButton handleRandom={testProps.handleRandom} />
);
