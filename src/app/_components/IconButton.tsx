import type { ComponentProps, JSX } from 'react';
import { Button, Text } from 'react-aria-components';
import { FaGithub } from 'react-icons/fa';

type Props = ComponentProps<'button'> & {
  displayText: string;
  showGithubIcon?: boolean;
  isPressed?: boolean;
};

export const IconButton = ({
  type,
  displayText,
  showGithubIcon,
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
    >
      {showGithubIcon != null && (
        <FaGithub className="size-5 text-orange-900" />
      )}
      <Text className="text-lg text-orange-900">{displayText}</Text>
    </Button>
  );
};
