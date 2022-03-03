import Footer from './Footer';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/Footer.tsx',
  component: Footer,
} as Meta<typeof Footer>;

type Story = ComponentStoryObj<typeof Footer>;

const style = {
  color: 'royalblue',
};

const props = {
  termsLink: (
    <a href="https://policies.google.com/terms" style={style}>
      利用規約
    </a>
  ),
  privacyLink: (
    <a href="https://policies.google.com/privacy" style={style}>
      プライバシーポリシー
    </a>
  ),
};

export const Default: Story = {
  args: props,
};
