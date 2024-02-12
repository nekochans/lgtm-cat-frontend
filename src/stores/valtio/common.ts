import type { Language } from '@/features';
import { proxy } from 'valtio';

export type CommonState = {
  isLanguageMenuDisplayed: boolean;
  language?: Language;
};

const commonState = proxy<CommonState>({
  isLanguageMenuDisplayed: false,
});

export const updateIsLanguageMenuDisplayed = (
  isLanguageMenuDisplayed: boolean,
): void => {
  commonState.isLanguageMenuDisplayed = isLanguageMenuDisplayed;
};

export const commonStateSelector = (): CommonState => commonState;
