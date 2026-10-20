import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from '../../theme/useTheme';

// Native dialog supplies focus trapping, Escape handling and focus restoration.
export function Dialog({ children, onClose, labelledBy, drawer = false }: { children: ReactNode; onClose: () => void; labelledBy: string; drawer?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [closing, setClosing] = useState(false);
  const { reducedMotion } = useTheme();
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { if (timer.current) clearTimeout(timer.current); dialog.close(); document.body.style.overflow = previous; };
  }, []);
  function close() {
    if (closing) return;
    const finish = () => { ref.current?.close(); opener.current?.focus({ preventScroll: true }); onClose(); };
    if (reducedMotion) { finish(); return; }
    setClosing(true);
    timer.current = setTimeout(finish, 180);
  }
  return <dialog ref={ref} className={`glass-dialog ${drawer ? 'theme-drawer' : 'report-dialog'} ${closing ? 'closing' : ''}`} aria-labelledby={labelledBy} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close(); } }}>
    <div className="dialog-inner">{children}<button type="button" className="dialog-dismiss" aria-label="Đóng cửa sổ" onClick={close}>×</button></div>
  </dialog>;
}
