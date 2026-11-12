'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import LoginModal from '@/component/LoginModal';

export default function LoginModalTrigger() {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState<string | undefined>();

  function handleOpen() {
    // Balik sa current page after login. Skip sa /login at /register para walang loop.
    const { pathname, search } = window.location;
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
    setNext(isAuthPage ? undefined : pathname + search);
    setOpen(true);
  }

  return (
    <>
      {/* A labelled pill (icon only on phones) so a signed-out visitor sees a different control
          than the plain account icon shown when signed in. */}
      <button
        type="button"
        aria-label="Log in"
        aria-haspopup="dialog"
        onClick={handleOpen}
        className="beu-icon-btn w-auto gap-1.5 bg-accent/15 px-3 text-sm font-semibold md:px-4"
      >
        <LogIn size={18} strokeWidth={1.75} aria-hidden="true" />
        <span className="hidden md:inline">Log in</span>
      </button>
      <LoginModal open={open} onClose={() => setOpen(false)} next={next} />
    </>
  );
}
