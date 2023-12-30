import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import type { Preview } from '@storybook/react';
import { initialize, mswDecorator } from 'msw-storybook-addon';

initialize();

export const decorators = [mswDecorator];

const customViewports = {
  iPhone11ProMax: {
    name: 'iPhone 11 Pro Max',
    styles: {
      width: '414px',
      height: '896px',
    },
  },
  iPhone13ProMax: {
    name: 'iPhone 13 Pro Max',
    styles: {
      width: '428px',
      height: '926px',
    },
  },
  googlePixel3: {
    name: 'Google Pixel 3',
    styles: {
      width: '411px',
      height: '823px',
    },
  },
  googlePixel5: {
    name: 'Google Pixel 5',
    styles: {
      width: '393px',
      height: '851px',
    },
  },
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    viewport: { viewports: { ...INITIAL_VIEWPORTS, ...customViewports } },
  },
};

export default preview;
