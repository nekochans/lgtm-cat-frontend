import initStoryshots, {
  multiSnapshotWithOptions,
} from '@storybook/addon-storyshots';

jest.mock('../hooks/useClipboardMarkdown', () => () => '');

initStoryshots({ test: multiSnapshotWithOptions() });
