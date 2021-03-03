import React from 'react';
import SimpleHeader from './SimpleHeader';

export default {
  title: 'src/components/SimpleHeader.tsx',
  component: SimpleHeader,
  includeStories: ['showSimpleHeader'],
};

export const showSimpleHeader = (): JSX.Element => <SimpleHeader />;
