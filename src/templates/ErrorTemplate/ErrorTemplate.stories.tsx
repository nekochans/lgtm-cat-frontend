import { Footer } from '@/components';
import { createIncludeLanguageAppPath } from '@/features';
import type { Meta, StoryObj } from '@storybook/react';
import { ErrorTemplate } from './';

const meta: Meta<typeof ErrorTemplate> = {
  component: ErrorTemplate,
};

export default meta;

type Story = StoryObj<typeof ErrorTemplate>;

const languageJa = 'ja';

const languageEn = 'en';

export const NotFoundViewInJapanese: Story = {
  args: {
    type: 404,
    language: languageJa,
    currentUrlPath: createIncludeLanguageAppPath('top', languageJa),
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

export const NotFoundViewInEnglish: Story = {
  args: {
    type: 404,
    language: languageEn,
    currentUrlPath: createIncludeLanguageAppPath('top', languageEn),
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

export const InternalServerErrorViewInJapanese: Story = {
  args: {
    type: 500,
    language: languageJa,
    currentUrlPath: createIncludeLanguageAppPath('upload', languageJa),
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

export const InternalServerErrorViewInEnglish: Story = {
  args: {
    type: 500,
    language: languageEn,
    currentUrlPath: createIncludeLanguageAppPath('upload', languageEn),
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

export const ServiceUnavailableViewInJapanese: Story = {
  args: {
    type: 503,
    language: languageJa,
    currentUrlPath: createIncludeLanguageAppPath('terms', languageJa),
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

export const ServiceUnavailableViewInEnglish: Story = {
  args: {
    type: 503,
    language: languageEn,
    currentUrlPath: createIncludeLanguageAppPath('terms', languageEn),
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
