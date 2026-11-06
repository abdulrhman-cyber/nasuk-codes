import { useCallback } from 'react';
import { useApp } from '../context';
import { copyText } from '../lib/format';

export function useCodeActions() {
  const { t, notify, markTried, recordOpen } = useApp();

  const copy = useCallback(
    async (code: string) => {
      const ok = await copyText(code);
      if (ok) {
        markTried(code);
        notify(t.codes.copySuccess, 'success');
      } else {
        notify(t.codes.copyFail, 'error');
      }
      return ok;
    },
    [markTried, notify, t.codes.copyFail, t.codes.copySuccess],
  );

  const open = useCallback(
    (code: string) => {
      recordOpen(code);
      notify(t.codes.openNote, 'info');
    },
    [notify, recordOpen, t.codes.openNote],
  );

  return { copy, open };
}
