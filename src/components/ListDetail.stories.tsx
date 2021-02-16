import React from 'react';
import ListDetail from './ListDetail';

export default {
  title: 'src/components/ListDetail.tsx',
  component: ListDetail,
  includeStories: ['showListDetailWithProp'],
};

export const testProps = {
  user: {
    id: 1,
    name: 'cat🐱',
  },
};

export const showListDetailWithProp = (): JSX.Element => (
  <ListDetail item={testProps.user} />
);
