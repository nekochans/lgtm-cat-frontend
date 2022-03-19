import '../styles/styles.scss';
import './__mocks/NextImage';

import { initialize, mswDecorator } from 'msw-storybook-addon';

initialize();

export const decorators = [mswDecorator];
