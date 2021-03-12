import { MutableRefObject, useEffect, useRef } from 'react';
import Clipboard from 'clipboard';

const useClipboardMarkdown = (
  onCopySuccess: () => void,
  url: string,
): { imageContextRef: MutableRefObject<null> } => {
  const buttonRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const cb = new Clipboard(buttonRef.current!, {
      text: () => `![LGTMeow](${url})`,
    });
    cb.on('success', () => {
      onCopySuccess();
    });

    return () => {
      cb.destroy();
    };
  }, [onCopySuccess, url]);

  return { imageContextRef: buttonRef };
};

export default useClipboardMarkdown;
