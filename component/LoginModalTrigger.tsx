'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
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
      <button type="button" aria-label="Log in" aria-haspopup="dialog" onClick={handleOpen}>
        <User size={20} strokeWidth={1.5} />
      </button>
      <LoginModal open={open} onClose={() => setOpen(false)} next={next} />
    </>
  );
}