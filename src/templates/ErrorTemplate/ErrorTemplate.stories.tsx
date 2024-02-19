import { createIncludeLanguageAppPath } from '@/features';
import type { Meta, StoryObj } from '@storybook/react';
import { ErrorTemplate } from './';

const meta: Meta<typeof ErrorTemplate> = {
  component: ErrorTemplate,
};

export default meta;

type Story = StoryObj<typeof ErrorTemplate>;

export const NotFoundViewInJapanese: Story = {
  args: {
    type: 404,
    language: 'ja',
    currentUrlPath: createIncludeLanguageAppPath('top', 'ja'),
  },
};

export const NotFoundViewInEnglish: Story = {
  args: {
    type: 404,
    language: 'en',
    currentUrlPath: createIncludeLanguageAppPath('top', 'en'),
  },
};

export const InternalServerErrorViewInJapanese: Story = {
  args: {
    type: 500,
    language: 'ja',
    currentUrlPath: createIncludeLanguageAppPath('upload', 'ja'),
  },
};

export const InternalServerErrorViewInEnglish: Story = {
  args: {
    type: 500,
    language: 'en',
    currentUrlPath: createIncludeLanguageAppPath('upload', 'en'),
  },
};

export const ServiceUnavailableViewInJapanese: Story = {
  args: {
    type: 503,
    language: 'ja',
    currentUrlPath: createIncludeLanguageAppPath('terms', 'ja'),
  },
};

export const ServiceUnavailableViewInEnglish: Story = {
  args: {
    type: 503,
    language: 'en',
    currentUrlPath: createIncludeLanguageAppPath('terms', 'en'),
  },
};
