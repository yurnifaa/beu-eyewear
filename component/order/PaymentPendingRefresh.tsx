'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const INTERVAL_MS = 3000;
const MAX_REFRESHES = 10;

// Rendered only while a payment is still being confirmed. The provider's webhook usually lands
// within seconds of the buyer coming back, so ask the server again every few seconds for a
// short while; each refresh re-checks the payment. Gives up quietly after about 30s.
export default function PaymentPendingRefresh() {
  const router = useRouter();

  useEffect(() => {
    let refreshes = 0;
    const timer = setInterval(() => {
      refreshes += 1;
      router.refresh();
      if (refreshes >= MAX_REFRESHES) clearInterval(timer);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
