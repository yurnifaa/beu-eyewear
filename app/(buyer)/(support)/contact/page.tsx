import type { Metadata } from 'next';
import Link from 'next/link';
import { AtSign, Mail, MessageCircleQuestion, Package, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import Reveal from '@/component/Reveal';
import SupportHeader from '@/component/support/SupportHeader';
import { getSupportInfo } from '@/component/support/support-info';

export const metadata: Metadata = { title: 'Contact' };
// Phones and email come from the store settings.
export const dynamic = 'force-dynamic';

function Channel({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-3 rounded-3xl border border-border bg-background/80 p-6 shadow-[0_18px_40px_rgba(40,100,180,0.1)] backdrop-blur md:p-7">
      <span className="beu-gloss flex size-11 items-center justify-center rounded-full text-ink">{icon}</span>
      <h2 className="mt-2 font-display text-base font-black uppercase tracking-[-0.01em]">{title}</h2>
      <div className="text-sm leading-relaxed text-foreground/75">{children}</div>
    </li>
  );
}

const linkClass = 'font-medium text-accent underline underline-offset-4';

export default async function ContactPage() {
  const info = await getSupportInfo();
  const handle = info.social?.replace(/^@/, '');

  return (
    <Reveal mode="mount" className="flex flex-col gap-10 md:gap-12">
      <SupportHeader
        eyebrow="Contact"
        title="Talk to us."
        description="Questions about a frame, a lens, or an order? Reach us through any of these and a real person will get back to you."
      />

      <ul className="grid list-none grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Channel icon={<Phone size={20} aria-hidden="true" />} title="Call us">
          <p className="flex flex-col gap-1">
            {info.phones.map((phone) => (
              <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={linkClass}>
                {phone}
              </a>
            ))}
          </p>
        </Channel>

        {info.email && (
          <Channel icon={<Mail size={20} aria-hidden="true" />} title="Email us">
            <a href={`mailto:${info.email}`} className={`${linkClass} break-all`}>
              {info.email}
            </a>
            <p className="mt-2">Include your order number if it&apos;s about an order.</p>
          </Channel>
        )}

        {handle && (
          <Channel icon={<AtSign size={20} aria-hidden="true" />} title="Message us">
            <p>
              Send us a DM <span className="font-medium text-foreground">@{handle}</span>.
            </p>
          </Channel>
        )}

        <Channel icon={<Package size={20} aria-hidden="true" />} title="About an order">
          <p>
            Track, review or cancel an order from your{' '}
            <Link href="/account/orders" className={linkClass}>
              order history
            </Link>
            .
          </p>
        </Channel>

        <Channel icon={<MessageCircleQuestion size={20} aria-hidden="true" />} title="Quick answers">
          <p>
            Shipping, payments and returns are covered in the{' '}
            <Link href="/faq" className={linkClass}>
              FAQ
            </Link>
            .
          </p>
        </Channel>
      </ul>
    </Reveal>
  );
}
