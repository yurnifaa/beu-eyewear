'use client';

import { useEffect, useRef } from 'react';
import LoginForm from '@/component/LoginForm';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  /** Path na babalikan after login (current page). */
  next?: string;
};

export default function LoginModal({ open, onClose, next }: LoginModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync the native <dialog> with the `open` prop. Esc, focus trap and
  // inert background come free from showModal().
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        // Clicks on the backdrop target the <dialog> itself.
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="login-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-foreground shadow-xl backdrop:bg-black/60 dark:bg-background"
    >
      <div className="px-6 py-8 sm:px-10">
        {/* Mounted only while open, so errors and fields reset every time. */}
        {open && <LoginForm next={next} onNavigate={onClose} onGuest={onClose} />}
      </div>
    </dialog>
  );
}