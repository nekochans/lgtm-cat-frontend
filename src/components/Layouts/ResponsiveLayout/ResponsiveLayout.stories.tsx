import type { Meta, StoryObj } from '@storybook/react';
import type { FC } from 'react';
import { ResponsiveLayout } from './';

const meta: Meta<typeof ResponsiveLayout> = {
  component: ResponsiveLayout,
};

export default meta;

type Story = StoryObj<typeof ResponsiveLayout>;

const JpContents: FC = () => (
  <>
    <h1>タイトル</h1>
    <h2>サブタイトル</h2>
    <p>コンテンツ</p>
  </>
);

const EnContents: FC = () => (
  <>
    <h1>Title</h1>
    <h2>SubTitle</h2>
    <p>Contents</p>
  </>
);

export const ViewInJapanese: Story = {
  args: {
    language: 'ja',
    children: <JpContents />,
  },
};

export const ViewInEnglish: Story = {
  args: {
    language: 'en',
    children: <EnContents />,
  },
};
