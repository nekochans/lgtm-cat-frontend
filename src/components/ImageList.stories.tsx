import ImageList from './ImageList';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/ImageList.tsx',
  component: ImageList,
} as Meta<typeof ImageList>;

type Story = ComponentStoryObj<typeof ImageList>;

const props = {
  lgtmImages: [
    {
      id: 1,
      url: '/cat.jpeg',
    },
    {
      id: 2,
      url: '/cat2.jpeg',
    },
    {
      id: 3,
      url: '/cat.jpeg',
    },
    {
      id: 4,
      url: '/cat2.jpeg',
    },
    {
      id: 5,
      url: '/cat.jpeg',
    },
    {
      id: 6,
      url: '/cat2.jpeg',
    },
    {
      id: 7,
      url: '/cat.jpeg',
    },
    {
      id: 8,
      url: '/cat2.jpeg',
    },
    {
      id: 9,
      url: '/cat.jpeg',
    },
  ],
};

export const Default: Story = {
  args: props,
};
