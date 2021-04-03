import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { Image } from '../domain/image';

export type AppState = {
  imageList: Image[];
  isFailedFetchImages: boolean;
};

const initialAppState: AppState = {
  imageList: [],
  isFailedFetchImages: false,
};

const AppStateContext = React.createContext<AppState>(initialAppState);
const SetAppStateContext = React.createContext<
  Dispatch<SetStateAction<AppState>>
>(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

export const useAppState = (): AppState => useContext(AppStateContext);
export const useSetAppState = (): Dispatch<SetStateAction<AppState>> =>
  useContext(SetAppStateContext);

export const AppStateProvider = (props: {
  // eslint-disable-next-line react/require-default-props
  initialState?: AppState;
  children: React.ReactNode;
}): JSX.Element => {
  const { initialState, children } = props;
  const [state, setState] = useState<AppState>(initialState || initialAppState);

  return (
    <AppStateContext.Provider value={state}>
      <SetAppStateContext.Provider value={setState}>
        {children}
      </SetAppStateContext.Provider>
    </AppStateContext.Provider>
  );
};
