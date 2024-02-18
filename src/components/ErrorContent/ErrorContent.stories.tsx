import {
  InternalServerErrorImage,
  NotFoundImage,
  ServiceUnavailableImage,
} from '@/components';
import type { Meta, StoryObj } from '@storybook/react';
import { ErrorContent } from './';

const meta: Meta<typeof ErrorContent> = {
  component: ErrorContent,
};

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

export const ShowRetryButtonViewInJapanese: Story = {
  args: {
    type: 500,
    language: 'ja',
    catImage: <InternalServerErrorImage />,
    shouldDisplayBackToTopButton: false,
    onClickRetryButton: () => {
      console.log('RetryButton clicked!');
    },
  },
};

export const ShowRetryButtonViewInEnglish: Story = {
  args: {
    type: 500,
    language: 'en',
    catImage: <InternalServerErrorImage />,
    shouldDisplayBackToTopButton: false,
    onClickRetryButton: () => {
      console.log('RetryButton clicked!');
    },
  },
};
