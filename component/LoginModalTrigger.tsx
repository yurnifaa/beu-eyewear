'use client';

import { useEffect, useState } from 'react';
import { LogIn } from 'lucide-react';
import LoginModal from '@/component/LoginModal';
import { LOGIN_EVENT } from '@/component/login-event';

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

  // The mobile menu's "Log in" row can't hold the modal (it sits inside the drawer), so it asks
  // this component, which stays mounted in the header, to open it.
  useEffect(() => {
    const onRequest = () => {
      const { pathname, search } = window.location;
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
      setNext(isAuthPage ? undefined : pathname + search);
      setOpen(true);
    };
    window.addEventListener(LOGIN_EVENT, onRequest);
    return () => window.removeEventListener(LOGIN_EVENT, onRequest);
  }, []);

  return (
    <>
      {/* A labelled pill so a signed-out visitor sees a different control than the plain account
          icon shown when signed in. */}
      <button
        type="button"
        aria-label="Log in"
        aria-haspopup="dialog"
        onClick={handleOpen}
        // Hidden below lg, where the burger menu has its own "Log in" row. The button, not a
        // wrapper, is hidden: the modal below must not sit inside a display:none ancestor.
        className="beu-icon-btn hidden w-auto shrink-0 gap-1.5 whitespace-nowrap bg-accent/15 px-4 text-sm font-semibold lg:inline-flex"
      >
        <LogIn size={18} strokeWidth={1.75} aria-hidden="true" />
        <span>Log in</span>
      </button>
      <LoginModal open={open} onClose={() => setOpen(false)} next={next} />
    </>
  );
}
