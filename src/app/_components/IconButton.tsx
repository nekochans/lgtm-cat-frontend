import type { ComponentProps, JSX } from 'react';
import { Button, Text } from 'react-aria-components';

const GithubIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M6.68952 15.9488C6.68952 16.0294 6.59677 16.0939 6.47984 16.0939C6.34677 16.106 6.25403 16.0415 6.25403 15.9488C6.25403 15.8682 6.34677 15.8037 6.46371 15.8037C6.58468 15.7916 6.68952 15.8561 6.68952 15.9488ZM5.43548 15.7675C5.40726 15.8481 5.4879 15.9408 5.60887 15.9649C5.71371 16.0052 5.83468 15.9649 5.85887 15.8843C5.88306 15.8037 5.80645 15.711 5.68548 15.6748C5.58065 15.6465 5.46371 15.6868 5.43548 15.7675ZM7.21774 15.6989C7.10081 15.7271 7.02016 15.8037 7.03226 15.8964C7.04435 15.977 7.14919 16.0294 7.27016 16.0012C7.3871 15.973 7.46774 15.8964 7.45564 15.8158C7.44355 15.7392 7.33468 15.6868 7.21774 15.6989ZM9.87097 0.254272C4.27823 0.254272 0 4.49833 0 10.0886C0 14.5583 2.81452 18.3832 6.83468 19.7294C7.35081 19.8221 7.53226 19.5037 7.53226 19.2417C7.53226 18.9918 7.52016 17.6134 7.52016 16.767C7.52016 16.767 4.69758 17.3716 4.10484 15.5659C4.10484 15.5659 3.64516 14.3931 2.98387 14.0908C2.98387 14.0908 2.06048 13.458 3.04839 13.4701C3.04839 13.4701 4.05242 13.5507 4.60484 14.51C5.4879 16.0657 6.96774 15.6183 7.54435 15.3523C7.6371 14.7074 7.89919 14.2601 8.18952 13.9941C5.93548 13.7442 3.66129 13.4177 3.66129 9.54041C3.66129 8.43204 3.96774 7.87584 4.6129 7.16648C4.50806 6.9045 4.16532 5.82435 4.71774 4.42981C5.56048 4.16783 7.5 5.51803 7.5 5.51803C8.30645 5.29233 9.17339 5.17544 10.0323 5.17544C10.8911 5.17544 11.7581 5.29233 12.5645 5.51803C12.5645 5.51803 14.504 4.1638 15.3468 4.42981C15.8992 5.82838 15.5565 6.9045 15.4516 7.16648C16.0968 7.87987 16.4919 8.43607 16.4919 9.54041C16.4919 13.4298 14.1169 13.7401 11.8629 13.9941C12.2339 14.3125 12.5484 14.917 12.5484 15.8642C12.5484 17.2224 12.5363 18.9031 12.5363 19.2336C12.5363 19.4956 12.7218 19.814 13.2339 19.7213C17.2661 18.3832 20 14.5583 20 10.0886C20 4.49833 15.4637 0.254272 9.87097 0.254272ZM3.91935 14.1553C3.86694 14.1956 3.87903 14.2883 3.94758 14.3649C4.0121 14.4293 4.10484 14.4576 4.15726 14.4052C4.20968 14.3649 4.19758 14.2722 4.12903 14.1956C4.06452 14.1311 3.97177 14.1029 3.91935 14.1553ZM3.48387 13.8288C3.45565 13.8812 3.49597 13.9457 3.57661 13.986C3.64113 14.0263 3.72177 14.0142 3.75 13.9578C3.77823 13.9054 3.7379 13.8409 3.65726 13.8006C3.57661 13.7764 3.5121 13.7885 3.48387 13.8288ZM4.79032 15.2636C4.72581 15.316 4.75 15.437 4.84274 15.5135C4.93548 15.6062 5.05242 15.6183 5.10484 15.5538C5.15726 15.5014 5.13306 15.3805 5.05242 15.3039C4.96371 15.2112 4.84274 15.1992 4.79032 15.2636ZM4.33065 14.6712C4.26613 14.7115 4.26613 14.8163 4.33065 14.909C4.39516 15.0017 4.50403 15.042 4.55645 15.0017C4.62097 14.9493 4.62097 14.8445 4.55645 14.7518C4.5 14.6591 4.39516 14.6188 4.33065 14.6712Z"
        fill="#7C2D12"
      />
    </svg>
  );
};

const RepeatIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M15.7704 0.361021C16.239 0.143546 16.7741 0.265332 17.1334 0.661135L19.6329 3.44481C19.8672 3.70578 20 4.05809 20 4.4278C20 4.7975 19.8672 5.14981 19.6329 5.41078L17.1334 8.19445C16.7741 8.59461 16.239 8.71204 15.7704 8.49457C15.3017 8.27709 14.9971 7.77255 14.9971 7.20712V5.82398H13.7473C13.3529 5.82398 12.9818 6.02841 12.7475 6.38072L11.0916 8.83818L9.52939 6.5199L10.7479 4.71051C11.4548 3.65793 12.5679 3.04031 13.7473 3.04031H14.9971V1.64847C14.9971 1.08739 15.3017 0.578495 15.7704 0.361021ZM6.405 11.1608L7.96719 13.4791L6.74868 15.2885C6.04179 16.3411 4.92873 16.9587 3.74927 16.9587H1.24976C0.558485 16.9587 0 16.3367 0 15.5668C0 14.797 0.558485 14.175 1.24976 14.175H3.74927C4.14372 14.175 4.51474 13.9706 4.74907 13.6183L6.405 11.1608ZM17.1295 19.3379C16.7702 19.738 16.2351 19.8554 15.7665 19.638C15.2978 19.4205 14.9932 18.916 14.9932 18.3505V16.9587H13.7473C12.5679 16.9587 11.4548 16.3411 10.7479 15.2885L4.74907 6.38072C4.51474 6.02841 4.14372 5.82398 3.74927 5.82398H1.24976C0.558485 5.82398 0 5.202 0 4.43214C0 3.66228 0.558485 3.04031 1.24976 3.04031H3.74927C4.92873 3.04031 6.04179 3.65793 6.74868 4.71051L12.7475 13.6183C12.9818 13.9706 13.3529 14.175 13.7473 14.175H14.9971V12.7832C14.9971 12.2221 15.3017 11.7132 15.7704 11.4957C16.239 11.2782 16.7741 11.4 17.1334 11.7958L19.6329 14.5795C19.8672 14.8405 20 15.1928 20 15.5625C20 15.9322 19.8672 16.2845 19.6329 16.5455L17.1334 19.3292L17.1295 19.3379Z"
        fill="#FFF7ED"
      />
    </svg>
  );
};

const RandomIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M5.2875 5.08008C7.87917 2.37435 12.0667 2.3613 14.675 5.03658L12.9583 6.82444C12.6708 7.1246 12.5875 7.57265 12.7417 7.96416C12.8958 8.35566 13.2625 8.60796 13.6667 8.60796H18.6458H19C19.5542 8.60796 20 8.14251 20 7.56395V1.9959C20 1.57394 19.7583 1.19114 19.3833 1.03019C19.0083 0.869238 18.5792 0.956239 18.2917 1.25639L16.5583 3.06601C12.9083 -0.696777 7.02917 -0.683726 3.4 3.10951C2.38333 4.17092 1.65 5.41938 1.2 6.75484C0.954167 7.4813 1.32083 8.27301 2.0125 8.52966C2.70417 8.78631 3.46667 8.40351 3.7125 7.6814C4.03333 6.73309 4.55417 5.84134 5.2875 5.08008ZM0 12.436V12.7666V12.7971V18.0041C0 18.426 0.241667 18.8088 0.616667 18.9698C0.991667 19.1307 1.42083 19.0437 1.70833 18.7436L3.44167 16.9339C7.09167 20.6967 12.9708 20.6837 16.6 16.8904C17.6167 15.829 18.3542 14.5806 18.8042 13.2495C19.05 12.523 18.6833 11.7313 17.9917 11.4746C17.3 11.218 16.5375 11.6008 16.2917 12.3229C15.9708 13.2712 15.45 14.163 14.7167 14.9242C12.125 17.6299 7.9375 17.643 5.32917 14.9677L7.04167 13.1755C7.32917 12.8754 7.4125 12.4273 7.25833 12.0358C7.10417 11.6443 6.7375 11.392 6.33333 11.392H1.35H1.32083H1C0.445833 11.392 0 11.8574 0 12.436Z"
        fill="#FFF7ED"
      />
    </svg>
  );
};

const CatIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M11.2492 7.56353H11.9172C12.7806 9.02159 14.3979 9.99997 16.2496 9.99997C16.6794 9.99997 17.1013 9.94668 17.4998 9.8477V9.99997V11.2182V18.5275C17.4998 19.2013 16.9411 19.7457 16.2496 19.7457C15.5582 19.7457 14.9995 19.2013 14.9995 18.5275V13.1673L9.68652 17.3093H11.8742C12.5657 17.3093 13.1243 17.8537 13.1243 18.5275C13.1243 19.2013 12.5657 19.7457 11.8742 19.7457H6.24869C4.17818 19.7457 2.49833 18.1088 2.49833 16.0911V7.58257C2.49833 6.96965 2.02954 6.4481 1.40448 6.37196L1.09585 6.33389C0.412194 6.25014 -0.0761338 5.64103 0.00981194 4.97482C0.0957576 4.3086 0.720817 3.83273 1.40448 3.91649L1.7131 3.95456C3.58828 4.18297 4.99857 5.7362 4.99857 7.58257V10.8299C6.34245 8.8617 8.63954 7.56353 11.2492 7.56353ZM17.4998 8.57237C17.1091 8.70562 16.6872 8.78175 16.2496 8.78175C15.1402 8.78175 14.1401 8.30969 13.4525 7.56353C13.308 7.40745 13.179 7.23994 13.0657 7.06102C12.7063 6.49759 12.4993 5.83518 12.4993 5.12709V1.47243V0.711044V0.661554C12.4993 0.436944 12.6829 0.258018 12.9134 0.254211H12.9212C13.0501 0.254211 13.1712 0.315122 13.2494 0.414103V0.41791L13.7494 1.06509L14.812 2.44701L14.9995 2.69065H17.4998L17.6873 2.44701L18.7499 1.06509L19.2499 0.41791V0.414103C19.3281 0.315122 19.4492 0.254211 19.5781 0.254211H19.5859C19.8164 0.258018 20 0.436944 20 0.661554V0.711044V1.47243V5.12709C20 5.78569 19.8203 6.40622 19.5078 6.9392C19.0663 7.69297 18.3514 8.27924 17.4998 8.57237ZM15.6246 5.12709C15.6246 4.96555 15.5587 4.81062 15.4415 4.69639C15.3243 4.58216 15.1653 4.51798 14.9995 4.51798C14.8337 4.51798 14.6748 4.58216 14.5575 4.69639C14.4403 4.81062 14.3745 4.96555 14.3745 5.12709C14.3745 5.28864 14.4403 5.44357 14.5575 5.5578C14.6748 5.67203 14.8337 5.7362 14.9995 5.7362C15.1653 5.7362 15.3243 5.67203 15.4415 5.5578C15.5587 5.44357 15.6246 5.28864 15.6246 5.12709ZM17.4998 5.7362C17.6655 5.7362 17.8245 5.67203 17.9417 5.5578C18.059 5.44357 18.1248 5.28864 18.1248 5.12709C18.1248 4.96555 18.059 4.81062 17.9417 4.69639C17.8245 4.58216 17.6655 4.51798 17.4998 4.51798C17.334 4.51798 17.175 4.58216 17.0578 4.69639C16.9406 4.81062 16.8747 4.96555 16.8747 5.12709C16.8747 5.28864 16.9406 5.44357 17.0578 5.5578C17.175 5.67203 17.334 5.7362 17.4998 5.7362Z"
        fill="#FFF7ED"
      />
    </svg>
  );
};

type Props = ComponentProps<'button'> & {
  displayText: string;
  showGithubIcon?: boolean;
  showRepeatIcon?: boolean;
  showRandomIcon?: boolean;
  showCatIcon?: boolean;
  isPressed?: boolean;
};

export const IconButton = ({
  type,
  displayText,
  showGithubIcon,
  showRepeatIcon,
  showRandomIcon,
  showCatIcon,
  isPressed,
}: Props): JSX.Element => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg px-7 py-1.5 text-black transition-colors duration-200';
  const stateClasses =
    isPressed === true ? 'bg-amber-500' : 'bg-amber-300 hover:bg-amber-100';
  const focusClasses =
    'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2';

  return (
    <Button
      type={type}
      className={`${baseClasses} ${stateClasses} ${focusClasses}`}
      isDisabled={isPressed}
      aria-pressed={isPressed}
    >
      {showGithubIcon != null && <GithubIcon />}
      {showRepeatIcon != null && <RepeatIcon />}
      {showRandomIcon != null && <RandomIcon />}
      {showCatIcon != null && <CatIcon />}
      <Text className="text-lg text-orange-900">{displayText}</Text>
    </Button>
  );
};
