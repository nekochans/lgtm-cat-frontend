import { errorType, type ErrorType, type Language } from '@/features';
import { assertNever } from '@/utils';
import type { FC, ReactNode } from 'react';
import { BackToTopButton } from './BackToTopButton';
import styles from './ErrorContent.module.css';
import { RetryButton } from './RetryButton';

const errorTitleText = {
  notFound: '404 Not Found',
  internalServerError: '500 Internal Server Error',
  serviceUnavailable: '503 Service Unavailable',
} as const;

type ErrorTitleText = (typeof errorTitleText)[keyof typeof errorTitleText];

const createErrorTitleText = (type: ErrorType): ErrorTitleText => {
  switch (type) {
    case errorType.notFound:
      return errorTitleText.notFound;
    case errorType.internalServerError:
      return errorTitleText.internalServerError;
    case errorType.serviceUnavailable:
      return errorTitleText.serviceUnavailable;
    default:
      return assertNever(type);
  }
};

const jaErrorMessageText = {
  notFound:
    'お探しのページは見つかりません。一時的にアクセス出来ない状態か、移動もしくは削除されてしまった可能性があります。',
  internalServerError:
    'システムエラーが発生しました。申し訳ありませんがしばらく時間がたってからお試しください。',
  serviceUnavailable:
    'メンテナンス中です。申し訳ありませんがしばらく時間がたってからお試しください。',
} as const;

type JaErrorMessageText =
  (typeof jaErrorMessageText)[keyof typeof jaErrorMessageText];

const enErrorMessageText = {
  notFound:
    'The page you are looking for cannot be found. It is temporarily inaccessible or has been removed.',
  internalServerError:
    'A system error has occurred. Sorry, please try again after some time has passed.',
  serviceUnavailable:
    'The system is under maintenance. Sorry, please try again after some time has passed.',
} as const;

type EnErrorMessageText =
  (typeof enErrorMessageText)[keyof typeof enErrorMessageText];

type ErrorMessageText = JaErrorMessageText | EnErrorMessageText;

const createErrorMessageText = (
  type: ErrorType,
  language: Language,
): ErrorMessageText => {
  switch (type) {
    case errorType.notFound:
      switch (language) {
        case 'ja':
          return jaErrorMessageText.notFound;
        case 'en':
          return enErrorMessageText.notFound;
        default:
          return assertNever(language);
      }
    case errorType.internalServerError:
      switch (language) {
        case 'ja':
          return jaErrorMessageText.internalServerError;
        case 'en':
          return enErrorMessageText.internalServerError;
        default:
          return assertNever(language);
      }
    case errorType.serviceUnavailable:
      switch (language) {
        case 'ja':
          return jaErrorMessageText.serviceUnavailable;
        case 'en':
          return enErrorMessageText.serviceUnavailable;
        default:
          return assertNever(language);
      }
    default:
      return assertNever(type);
  }
};

export type Props = {
  type: ErrorType;
  language: Language;
  catImage: ReactNode;
  shouldDisplayBackToTopButton: boolean;
  onClickRetryButton?: () => void;
};

export const ErrorContent: FC<Props> = ({
  type,
  catImage,
  language,
  shouldDisplayBackToTopButton,
  onClickRetryButton,
}) => (
  <div className={styles.wrapper}>
    <div className={styles.title}>{createErrorTitleText(type)}</div>
    <div className={styles['image-wrapper']}>{catImage}</div>
    <div className={styles.message}>
      {createErrorMessageText(type, language)}
    </div>
    {shouldDisplayBackToTopButton ? (
      <BackToTopButton language={language} />
    ) : (
      ''
    )}
    {onClickRetryButton ? (
      <RetryButton
        language={language}
        onClick={() => {
          onClickRetryButton();
        }}
      />
    ) : (
      ''
    )}
  </div>
);
