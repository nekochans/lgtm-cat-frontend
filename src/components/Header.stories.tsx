import React from 'react';
import Header from './Header';

export default {
  title: 'src/components/Header.tsx',
  component: Header,
  includeStories: ['showHeader'],
};

export const showHeader = (): JSX.Element => <Header />;
