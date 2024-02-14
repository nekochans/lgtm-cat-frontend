import {
  fetchLgtmImagesInRecentlyCreatedUrl,
  fetchLgtmImagesUrl,
  type LgtmImage,
} from '@/features';
import { mockFetchLgtmImages, mockInternalServerError } from '@/mocks';
import type { Meta, StoryObj } from '@storybook/react';
import { http } from 'msw';
import { TopTemplate } from './.';

const meta: Meta<typeof TopTemplate> = {
  component: TopTemplate,
};

export default meta;

type Story = StoryObj<typeof TopTemplate>;

const lgtmImages: LgtmImage[] = [
  {
    id: 1,
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2022/03/18/23/3086a0f3-52fc-46fa-af82-e9b7d307b155.webp',
  } as const,
  {
    id: 2,
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2021/11/16/22/76de320a-b44c-4134-83f1-b874c4ff8663.webp',
  } as const,
  {
    id: 3,
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2021/11/16/22/8302f89d-0fda-409d-b0db-0cef2283ed8b.webp',
  } as const,
  {
    id: 4,
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2021/11/16/22/a95f34d4-edf9-4dab-b502-2db205375f3c.webp',
  } as const,
  {
    id: 5,
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2022/01/21/14/b9ed8f20-16a0-47ef-8e3e-e46e872612fc.webp',
  } as const,
  {
    id: 6,
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2022/03/05/00/4057d714-168d-4696-90df-dec57c8957bb.webp',
  } as const,
  {
    id: 7,
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2022/04/01/23/a367f362-e26a-43e2-ad61-6c0bd6abdeb2.webp',
  } as const,
  {
    id: 8,
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2022/04/16/22/d7d04f68-9c08-4345-ae1e-19db45680588.webp',
  } as const,
  {
    id: 9,
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2021/03/16/00/62b7b519-9811-4e05-8c39-3c6dbab0a42d.webp',
  } as const,
];

export const ViewInJapanese: Story = {
  args: {
    language: 'ja',
    lgtmImages,
  },
  parameters: {
    msw: {
      handlers: [
        http.get(fetchLgtmImagesUrl(), mockFetchLgtmImages),
        http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockFetchLgtmImages),
      ],
    },
  },
};

export const ViewInEnglish: Story = {
  args: {
    language: 'en',
    lgtmImages,
  },
  parameters: {
    msw: {
      handlers: [
        http.get(fetchLgtmImagesUrl(), mockFetchLgtmImages),
        http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockFetchLgtmImages),
      ],
    },
  },
};

export const ViewInJapaneseError: Story = {
  args: {
    language: 'ja',
    lgtmImages,
  },
  parameters: {
    msw: {
      handlers: [
        http.get(fetchLgtmImagesUrl(), mockInternalServerError),
        http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockInternalServerError),
      ],
    },
  },
};

export const ViewInEnglishError: Story = {
  args: {
    language: 'en',
    lgtmImages,
  },
  parameters: {
    msw: {
      handlers: [
        http.get(fetchLgtmImagesUrl(), mockInternalServerError),
        http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockInternalServerError),
      ],
    },
  },
};
