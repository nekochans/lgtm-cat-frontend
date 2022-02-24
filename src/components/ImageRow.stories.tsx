import ImageRow from './ImageRow';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/ImageRow.tsx',
  component: ImageRow,
} as Meta<typeof ImageRow>;

type Story = ComponentStoryObj<typeof ImageRow>;

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
  ],
};

export const Default: Story = {
  args: props,
};
