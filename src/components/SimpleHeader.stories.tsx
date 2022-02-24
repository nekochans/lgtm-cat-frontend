import SimpleHeader from './SimpleHeader';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/SimpleHeader.tsx',
  component: SimpleHeader,
} as Meta<typeof SimpleHeader>;

type Story = ComponentStoryObj<typeof SimpleHeader>;

const props = {
  topLink: (
    <a
      className="navbar-item"
      href="https://github.com/nekochans/lgtm-cat-frontend"
    >
      <p className="is-size-4 has-text-black">LGTMeow</p>
    </a>
  ),
};

export const Default: Story = {
  args: props,
};
