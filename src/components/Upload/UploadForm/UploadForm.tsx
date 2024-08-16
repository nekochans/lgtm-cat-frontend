'use client';

import type { AppUrl } from '@/constants';
import {
  createPrivacyPolicyLinksFromLanguages,
  extractImageExtFromValidFileType,
  isAcceptableFileSize,
  isLgtmImageUrl,
  isValidFileType,
  type AcceptedTypesImageExtension,
  type ImageUploader,
  type ImageValidator,
  type Language,
  type LgtmImageUrl,
} from '@/features';
import { assertNever } from '@/utils';
import Link from 'next/link';
import {
  useCallback,
  useState,
  type ChangeEvent,
  type FC,
  type FormEvent,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { UploadButton } from '../UploadButton';
import { UploadErrorMessageArea } from '../UploadErrorMessageArea';
import { UploadModal } from '../UploadModal';
import { UploadTitleArea } from '../UploadTitleArea';
import {
  cautionText,
  createImageSizeTooLargeErrorMessage,
  createNotAllowedImageExtensionErrorMessage,
  imageDropAreaText,
  noteList,
  unexpectedErrorMessage,
  uploadInputButtonText,
} from './i18n';
import styles from './UploadForm.module.css';

export const createPrivacyPolicyArea = (language: Language): JSX.Element => {
  const privacyLinkAttribute = createPrivacyPolicyLinksFromLanguages(language);

  switch (language) {
    case 'ja':
      return (
        <div className={styles['privacy-policy-area']}>
          アップロードするボタンを押下することで{' '}
          <Link href={privacyLinkAttribute.link} prefetch={false}>
            <span className={styles['privacy-link-text']}>
              {privacyLinkAttribute.text}
            </span>
          </Link>{' '}
          に同意したと見なします
        </div>
      );
    case 'en':
      return (
        <div className={styles['privacy-policy-area']}>
          By pressing the upload button, you agree to the{' '}
          <Link href={privacyLinkAttribute.link} prefetch={false}>
            <span className={styles['privacy-link-text']}>
              {privacyLinkAttribute.text}
            </span>
          </Link>{' '}
          .
        </div>
      );
    default:
      return assertNever(language);
  }
};

export type Props = {
  language: Language;
  imageValidator: ImageValidator;
  imageUploader: ImageUploader;
  uploadCallback?: () => void;
  onClickCreatedLgtmImage?: () => void;
  onClickMarkdownSourceCopyButton?: () => void;
  appUrl?: AppUrl;
};

export const UploadForm: FC<Props> = ({
  language,
  imageValidator,
  imageUploader,
  uploadCallback,
  onClickCreatedLgtmImage,
  onClickMarkdownSourceCopyButton,
  appUrl,
}) => {
  const [base64Image, setBase64Image] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [uploadImageExtension, setUploadImageExtension] = useState<
    // FormをResetする際に空文字を受け付ける必要があるので @typescript-eslint/no-redundant-type-constituents を無効化
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    AcceptedTypesImageExtension | string
  >('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [uploaded, setUploaded] = useState<boolean>();
  const [createdLgtmImageUrl, setCreatedLgtmImageUrl] = useState<
    // FormをResetする際に空文字を受け付ける必要があるので @typescript-eslint/no-redundant-type-constituents を無効化
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    LgtmImageUrl | string
  >('');
  const [displayErrorMessages, setDisplayErrorMessages] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setUploaded(false);
    setCreatedLgtmImageUrl('');
    setModalIsOpen(false);
  };

  // エラーが起きた時にStateを初期化する為に利用する
  const stateInitAtError = () => {
    setImagePreviewUrl('');
    setUploadImageExtension('');
    setIsLoading(false);
    closeModal();
  };

  const handleReaderLoaded = (event: ProgressEvent<FileReader>) => {
    if (event.target === null) {
      return;
    }

    const binaryString = event.target?.result;
    if (typeof binaryString !== 'string') {
      return;
    }

    setBase64Image(window.btoa(binaryString));
  };

  const mightConvertImageToBase64 = (file: File) => {
    setUploaded(false);
    const fileType = file.type;
    if (!isValidFileType(fileType)) {
      setDisplayErrorMessages(
        createNotAllowedImageExtensionErrorMessage(fileType, language),
      );
      stateInitAtError();

      return;
    }

    if (!isAcceptableFileSize(file)) {
      setDisplayErrorMessages(createImageSizeTooLargeErrorMessage(language));
      stateInitAtError();

      return;
    }

    const url = URL.createObjectURL(file);

    setImagePreviewUrl(url);
    setUploadImageExtension(extractImageExtFromValidFileType(fileType));

    const reader = new FileReader();
    reader.onload = handleReaderLoaded;
    reader.readAsBinaryString(file);

    openModal();
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (event.target.files && event.target.files.length > 0) {
      const targetIndex = 0;
      const file = event.target.files[targetIndex];
      mightConvertImageToBase64(file);
    }
  };

  const shouldDisableButton = (): boolean => {
    if (displayErrorMessages.length !== 0) {
      return true;
    }

    return imagePreviewUrl === '';
  };

  const onClickUploadButton = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    openModal();
  };

  const executeUpload = async () => {
    setIsLoading(true);

    try {
      const imageValidationResult = await imageValidator(
        base64Image,
        uploadImageExtension as AcceptedTypesImageExtension,
      );

      if (
        !imageValidationResult.value.isAcceptableCatImage ||
        imageValidationResult.value.notAcceptableReason.length !== 0
      ) {
        setDisplayErrorMessages(
          imageValidationResult.value.notAcceptableReason,
        );
        stateInitAtError();

        return;
      }

      const imageUploadResult = await imageUploader(
        base64Image,
        uploadImageExtension as AcceptedTypesImageExtension,
      );

      setIsLoading(false);
      // setCreatedLgtmImageUrlで空文字を指定しているのでtruthyな値での判定を許可する
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (imageUploadResult.value.createdLgtmImageUrl) {
        setUploaded(true);
        setDisplayErrorMessages([]);
        setCreatedLgtmImageUrl(imageUploadResult.value.createdLgtmImageUrl);

        if (uploadCallback) {
          uploadCallback();
        }
      }

      if (imageUploadResult.value.displayErrorMessages.length !== 0) {
        setDisplayErrorMessages(imageUploadResult.value.displayErrorMessages);
        stateInitAtError();
      }
    } catch (error) {
      setDisplayErrorMessages(unexpectedErrorMessage(language));
      stateInitAtError();

      if (error instanceof Error) {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onClickClose = () => {
    closeModal();
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const targetIndex = 0;
      const file = acceptedFiles[targetIndex];

      mightConvertImageToBase64(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { getRootProps } = useDropzone({ onDrop });

  return (
    <div className={styles.wrapper}>
      {}
      {displayErrorMessages.length === 0 ? (
        ''
      ) : (
        <UploadErrorMessageArea messages={displayErrorMessages} />
      )}
      <UploadTitleArea language={language} />
      <form className={styles.form}>
        {}
        <div {...getRootProps()} className={styles['input-file-area']}>
          <FaCloudUploadAlt className={styles['fa-cloud-upload-alt']} />
          <div className={styles.text}>{imageDropAreaText(language)}</div>
          <label className={styles['input-file-label']}>
            <div className={styles['input-file-label-text']}>
              {uploadInputButtonText(language)}
            </div>
            <input
              type="file"
              className={styles['input-file']}
              onChange={handleFileUpload}
            />
          </label>
        </div>
        <div className={styles['max-upload-size-text']}>
          Maximum upload size is 4MB
        </div>
        <div className={styles['description-area-wrapper']}>
          <div className={styles['caution-text-area']}>
            {cautionText(language)}
          </div>
          <div className={styles.notes}>
            {noteList(language).map((note, index) => (
              <p key={index}>{note}</p>
            ))}
          </div>
          {createPrivacyPolicyArea(language)}
        </div>
        <div className={styles['upload-button-wrapper']}>
          <UploadButton
            language={language}
            disabled={shouldDisableButton()}
            onClick={onClickUploadButton}
          />
        </div>
      </form>
      {imagePreviewUrl || isLgtmImageUrl(createdLgtmImageUrl) ? (
        <UploadModal
          isOpen={modalIsOpen}
          language={language}
          imagePreviewUrl={imagePreviewUrl}
          onClickUpload={executeUpload}
          onClickCancel={closeModal}
          onClickClose={onClickClose}
          isLoading={isLoading}
          uploaded={uploaded}
          createdLgtmImageUrl={createdLgtmImageUrl as LgtmImageUrl}
          onClickCreatedLgtmImage={onClickCreatedLgtmImage}
          onClickMarkdownSourceCopyButton={onClickMarkdownSourceCopyButton}
          appUrl={appUrl}
        />
      ) : (
        ''
      )}
    </div>
  );
};
