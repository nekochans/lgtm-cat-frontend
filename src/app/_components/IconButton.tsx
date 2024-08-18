import type { ComponentProps, JSX } from 'react';
import { Button, Text } from 'react-aria-components';
import { FaGithub } from 'react-icons/fa';

type Props = ComponentProps<'button'> & {
  displayText: string;
  showGithubIcon?: boolean;
  isPending?: boolean;
};

export const IconButton = ({
  type,
  displayText,
  showGithubIcon,
  isPending,
}: Props): JSX.Element => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg px-7 py-1.5 text-black transition-colors duration-200';
  const stateClasses =
    isPending === true ? 'bg-amber-500' : 'bg-amber-300 hover:bg-amber-100';
  const focusClasses =
    'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2';

  return (
    <Button
      type={type}
      className={`${baseClasses} ${stateClasses} ${focusClasses}`}
      isDisabled={isPending}
    >
      {showGithubIcon != null && <FaGithub className="size-5" />}
      <Text>{displayText}</Text>
    </Button>
  );
};
