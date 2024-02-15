import { commonStateSelector, updateIsLanguageMenuDisplayed } from '@/stores';
import type { MouseEvent, MouseEventHandler } from 'react';
import { useSnapshot } from 'valtio';

type UseSwitchLanguageResponse = {
  isLanguageMenuDisplayed: boolean;
  onClickLanguageButton: MouseEventHandler<HTMLDivElement>;
  onClickOutSideMenu: MouseEventHandler<HTMLDivElement>;
};

export const useSwitchLanguage = (): UseSwitchLanguageResponse => {
  const snap = useSnapshot(commonStateSelector());

  const { isLanguageMenuDisplayed } = snap;

  const onClickLanguageButton: MouseEventHandler<HTMLDivElement> = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    event: MouseEvent<HTMLDivElement>,
  ) => {
    updateIsLanguageMenuDisplayed(!isLanguageMenuDisplayed);
  };

  const onClickOutSideMenu: MouseEventHandler<HTMLDivElement> = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    event: MouseEvent<HTMLDivElement>,
  ) => {
    // メニューの外側をクリックしたときだけメニューを閉じる
    if (isLanguageMenuDisplayed) {
      updateIsLanguageMenuDisplayed(false);
    }
  };

  return {
    isLanguageMenuDisplayed,
    onClickLanguageButton,
    onClickOutSideMenu,
  };
};
