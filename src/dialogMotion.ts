import type { RefObject } from 'react';

export function closeDialog(dialog: RefObject<HTMLDialogElement | null>) {
  const element = dialog.current;
  if (!element?.open || element.dataset.closing === 'true') return;
  element.dataset.closing = 'true';
  element.animate([{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(10px) scale(.985)' }], { duration: 170, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished.finally(() => {
    delete element.dataset.closing;
    if (element.open) element.close();
  });
}
