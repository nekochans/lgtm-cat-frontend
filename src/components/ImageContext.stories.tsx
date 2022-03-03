import ImageContext from './ImageContent';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/ImageContext.tsx',
  component: ImageContext,
} as Meta<typeof ImageContext>;

type Story = ComponentStoryObj<typeof ImageContext>;

const props = {
  image: {
    id: 1,
    url: '/cat.jpeg',
  },
};

export const Default: Story = {
  args: props,
};
