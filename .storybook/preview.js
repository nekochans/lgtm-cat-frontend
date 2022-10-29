import 'ress/ress.css';
import '../src/styles/markdown.css';
import { initialize, mswDecorator } from 'msw-storybook-addon';

initialize();

const customViewports = {
  iPhone11ProMax: {
    name: 'iPhone 11 Pro Max',
    styles: {
      width: '414px',
      height: '896px',
    },
  },
  iPhone12: {
    name: 'iPhone 12 Pro',
    styles: {
      width: '390px',
      height: '844px',
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
  iPadMini: {
    name: 'iPad mini 2〜5',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  iPadMini6: {
    name: 'iPad mini 6',
    styles: {
      width: '744px',
      height: '1133px',
    },
  },
  iPadPro11: {
    name: 'iPad Pro 11',
    styles: {
      width: '834px',
      height: '1194px',
    },
  },
};

// https://github.com/RyanClementsHax/storybook-addon-next/issues/99#issuecomment-1247073410 に記載してある暫定対応を実施
// https://github.com/RyanClementsHax/storybook-addon-next/pull/121 がマージされたら不要になるハズ
import Image from 'next/image';

const OriginalImage = Image.default;
Object.defineProperty(Image, 'default', {
  configurable: true,
  value: (props) => <OriginalImage {...props} unoptimized />,
});

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: { viewports: customViewports },
};

export const decorators = [mswDecorator];
