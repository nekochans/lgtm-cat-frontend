import '../src/app/globals.css';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';

initialize();

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
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: { viewports: { ...INITIAL_VIEWPORTS, ...customViewports } },
  },
  loaders: [mswLoader],
};

export default preview;
