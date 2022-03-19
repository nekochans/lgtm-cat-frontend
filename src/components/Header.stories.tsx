import Header from './Header';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/Header.tsx',
  component: Header,
} as Meta<typeof Header>;

type Story = ComponentStoryObj<typeof Header>;

const props = {
  topLink: (
    <a className="navbar-item" href="https://policies.google.com">
      <p className="is-size-4 has-text-black">LGTMeow</p>
    </a>
  ),
  uploadLink: (
    <a
      className="navbar-item button"
      style={{ margin: '0.5rem 0.75rem' }}
      href="https://github.com/nekochans/lgtm-cat-frontend"
    >
      <p className="has-text-black">猫ちゃん画像をアップロード</p>
    </a>
  ),
};

export const Default: Story = {
  args: props,
};
