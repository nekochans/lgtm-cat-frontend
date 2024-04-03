import {
  InternalServerErrorImage,
  NotFoundImage,
  ServiceUnavailableImage,
} from '@/components';
import type { Meta, StoryObj } from '@storybook/react';
import { ErrorContent } from './';

const meta = {
  component: ErrorContent,
} satisfies Meta<typeof ErrorContent>;

export default meta;

type Story = StoryObj<typeof ErrorContent>;

export const NotFoundViewInJapanese: Story = {
  args: {
    type: 404,
    language: 'ja',
    catImage: <NotFoundImage />,
    shouldDisplayBackToTopButton: true,
  },
};

export const NotFoundViewInEnglish: Story = {
  args: {
    type: 404,
    language: 'en',
    catImage: <NotFoundImage />,
    shouldDisplayBackToTopButton: true,
  },
};

export const InternalServerErrorViewInJapanese: Story = {
  args: {
    type: 500,
    language: 'ja',
    catImage: <InternalServerErrorImage />,
    shouldDisplayBackToTopButton: true,
  },
};

export const InternalServerErrorViewInEnglish: Story = {
  args: {
    type: 500,
    language: 'en',
    catImage: <InternalServerErrorImage />,
    shouldDisplayBackToTopButton: true,
  },
};

export const ServiceUnavailableViewInJapanese: Story = {
  args: {
    type: 503,
    language: 'ja',
    catImage: <ServiceUnavailableImage />,
    shouldDisplayBackToTopButton: true,
  },
};

export const ServiceUnavailableViewInEnglish: Story = {
  args: {
    type: 503,
    language: 'en',
    catImage: <ServiceUnavailableImage />,
    shouldDisplayBackToTopButton: true,
  },
};
