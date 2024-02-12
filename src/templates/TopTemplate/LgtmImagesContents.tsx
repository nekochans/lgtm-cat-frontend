import { CatButtonGroup, ErrorContent, LgtmImages } from '@/components';
import { type AppUrl } from '@/constants';
import { errorType, type Language, type LgtmImage } from '@/features';
import { lgtmImageStateSelector } from '@/stores';
import type { FC, ReactNode } from 'react';
import { useSnapshot } from 'valtio';
import { AppDescriptionArea } from './AppDescriptionArea';
import { CatRandomCopyButtonWrapper } from './CatRandomCopyButtonWrapper';
import styles from './LgtmImagesContents.module.css';

type Props = {
  language: Language;
  lgtmImages: LgtmImage[];
  errorCatImage: ReactNode;
  onClickFetchRandomCatButton: () => Promise<void>;
  onClickFetchNewArrivalCatButton: () => Promise<void>;
  appUrl?: AppUrl;
  clipboardMarkdownCallback?: () => void;
  fetchRandomCatImagesCallback?: () => void;
  fetchNewArrivalCatImagesCallback?: () => void;
  catRandomCopyCallback?: () => void;
};

export const LgtmImagesContents: FC<Props> = ({
  language,
  lgtmImages,
  errorCatImage,
  onClickFetchRandomCatButton,
  onClickFetchNewArrivalCatButton,
  appUrl,
  catRandomCopyCallback,
  clipboardMarkdownCallback,
}) => {
  const snap = useSnapshot(lgtmImageStateSelector());

  const fetchedLgtmImagesList = snap.lgtmImages ? snap.lgtmImages : lgtmImages;

  const { isFailedFetchLgtmImages } = snap;

  const { imageUrl } =
    fetchedLgtmImagesList[
      Math.floor(Math.random() * fetchedLgtmImagesList.length)
    ];

  return (
    <div className={styles.wrapper}>
      <AppDescriptionArea language={language} />
      <CatRandomCopyButtonWrapper
        appUrl={appUrl}
        imageUrl={imageUrl}
        callback={catRandomCopyCallback}
      />
      <CatButtonGroup
        onClickFetchRandomCatButton={onClickFetchRandomCatButton}
        onClickFetchNewArrivalCatButton={onClickFetchNewArrivalCatButton}
      />
      {isFailedFetchLgtmImages === true ? (
        <ErrorContent
          type={errorType.internalServerError}
          language={language}
          catImage={errorCatImage}
          shouldDisplayBackToTopButton={false}
        />
      ) : (
        <LgtmImages
          images={fetchedLgtmImagesList as LgtmImage[]}
          appUrl={appUrl}
          callback={clipboardMarkdownCallback}
        />
      )}
    </div>
  );
};
