'use client';

import { LogIn } from 'lucide-react';
import { LOGIN_EVENT } from '@/component/login-event';
import { menuRowClass } from '@/component/menu-row';

// The signed-out "Log in" row at the bottom of the mobile menu. The login modal itself is owned by
// LoginModalTrigger in the header (outside the drawer, so it stays visible once the drawer closes);
// this row closes the drawer and asks it to open.
export default function LoginMenuItem() {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(event) => {
        event.currentTarget.closest('dialog')?.close();
        window.dispatchEvent(new Event(LOGIN_EVENT));
      }}
      className={`${menuRowClass(false)} w-full text-left`}
    >
      <LogIn size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      Log in
    </button>
  );
}
