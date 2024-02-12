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
  },
};

export const NotFoundViewInEnglish: Story = {
  args: {
    type: 404,
    language: 'en',
  },
};

export const InternalServerErrorViewInJapanese: Story = {
  args: {
    type: 500,
    language: 'ja',
  },
};

export const InternalServerErrorViewInEnglish: Story = {
  args: {
    type: 500,
    language: 'en',
  },
};

export const ServiceUnavailableViewInJapanese: Story = {
  args: {
    type: 503,
    language: 'ja',
  },
};

export const ServiceUnavailableViewInEnglish: Story = {
  args: {
    type: 503,
    language: 'en',
  },
};
