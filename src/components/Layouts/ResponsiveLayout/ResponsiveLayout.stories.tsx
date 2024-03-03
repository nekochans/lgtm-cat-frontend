import { Footer } from '@/components';
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

const languageJa = 'ja';

const languageEn = 'en';

export const ViewInJapanese: Story = {
  args: {
    language: languageJa,
    children: <JpContents />,
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    (Story) => (
      <>
        <Story />
        <Footer language={languageJa} />
      </>
    ),
  ],
};

export const ViewInEnglish: Story = {
  args: {
    language: languageEn,
    children: <EnContents />,
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    (Story) => (
      <>
        <Story />
        <Footer language={languageEn} />
      </>
    ),
  ],
};
