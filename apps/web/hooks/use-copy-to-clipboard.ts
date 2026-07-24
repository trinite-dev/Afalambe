import { useCallback, useRef, useState } from 'react';
import { notifyApiSuccess, notifyApiError } from '@/lib/api-toast';

type UseCopyToClipboardProps = {
  copyMessage?: string;
  copyFailedMessage?: string;
};

export function useCopyToClipboard({
  copyMessage = 'Copie dans le presse-papiers',
  copyFailedMessage = 'Impossible de copier dans le presse-papiers.',
}: UseCopyToClipboardProps = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          notifyApiSuccess({ title: copyMessage });
          setIsCopied(true);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          timeoutRef.current = setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        })
        .catch(() => {
          notifyApiError({ title: copyFailedMessage });
        });
    },
    [copyFailedMessage, copyMessage],
  );

  return { isCopied, handleCopy };
}
