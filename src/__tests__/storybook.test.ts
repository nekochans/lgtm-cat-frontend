import initStoryshots, {
  multiSnapshotWithOptions,
} from '@storybook/addon-storyshots';
import * as AppStateContextModule from '../contexts/AppStateContext';
import appState from './data/appState';

jest.mock('../hooks/useClipboardMarkdown', () => () => '');
jest.spyOn(AppStateContextModule, 'useAppState').mockReturnValue(appState);

initStoryshots({ test: multiSnapshotWithOptions() });
