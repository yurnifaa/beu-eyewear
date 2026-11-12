'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LogIn } from 'lucide-react';
import { LOGIN_EVENT } from '@/component/login-event';
import { preloadLoginModal } from '@/component/login-modal-loader';

// Its own chunk: the modal's form brings the validation library with it (see login-modal-loader.ts).
const LoginModal = dynamic(() => import('@/component/LoginModal'));

export default function LoginModalTrigger() {
  const [open, setOpen] = useState(false);
  // The modal is only mounted once somebody has asked for it, and stays mounted after that.
  const [requested, setRequested] = useState(false);
  const [next, setNext] = useState<string | undefined>();

  const openModal = useCallback(() => {
    // Balik sa current page after login. Skip sa /login at /register para walang loop.
    const { pathname, search } = window.location;
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
    setNext(isAuthPage ? undefined : pathname + search);
    setRequested(true);
    setOpen(true);
  }, []);

  // The mobile menu's "Log in" row can't hold the modal (it sits inside the drawer), so it asks
  // this component, which stays mounted in the header, to open it.
  useEffect(() => {
    window.addEventListener(LOGIN_EVENT, openModal);
    return () => window.removeEventListener(LOGIN_EVENT, openModal);
  }, [openModal]);

  return (
    <>
      {/* A labelled pill so a signed-out visitor sees a different control than the plain account
          icon shown when signed in. */}
      <button
        type="button"
        aria-label="Log in"
        aria-haspopup="dialog"
        onClick={openModal}
        onPointerEnter={preloadLoginModal}
        onFocus={preloadLoginModal}
        // Hidden below lg, where the burger menu has its own "Log in" row. The button, not a
        // wrapper, is hidden: the modal below must not sit inside a display:none ancestor.
        className="beu-icon-btn hidden w-auto shrink-0 gap-1.5 whitespace-nowrap bg-accent/15 px-4 text-sm font-semibold lg:inline-flex"
      >
        <LogIn size={18} strokeWidth={1.75} aria-hidden="true" />
        <span>Log in</span>
      </button>
      {requested && <LoginModal open={open} onClose={() => setOpen(false)} next={next} />}
    </>
  );
}
