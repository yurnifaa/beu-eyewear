import type { Metadata } from 'next';
import Link from 'next/link';
import Panel from '@/component/account/Panel';
import Reveal from '@/component/Reveal';
import { ProseList, ProseSection } from '@/component/support/Prose';
import SupportHeader from '@/component/support/SupportHeader';

export const metadata: Metadata = { title: 'Terms & Privacy' };

const link = 'font-medium text-accent underline underline-offset-4';

// TODO(legal): plain-language draft that describes what the storefront does today. It is not legal
// advice; have it reviewed before launch (the Data Privacy Act of 2012 applies to a PH store).
export default function TermsPrivacyPage() {
  return (
    <Reveal mode="mount" className="flex flex-col gap-10 md:gap-12">
      <SupportHeader
        eyebrow="Policies"
        title="Terms & privacy"
        description="The ground rules for using BeU, and what we do with your information."
      />

      <Panel title="Terms of use" index="01">
        <ProseSection title="Using the site" index="1.1">
          <p>By browsing or buying from BeU Eyewear you agree to these terms. If you don&apos;t agree, please don&apos;t use the site.</p>
        </ProseSection>
        <ProseSection title="Your account" index="1.2">
          <ProseList
            items={[
              'Give accurate details and keep your password to yourself.',
              "You're responsible for activity on your account.",
              'Tell us right away if you think someone else has access.',
            ]}
          />
        </ProseSection>
        <ProseSection title="Products and prices" index="1.3">
          <p>
            We do our best to show colours, prices and stock accurately. If we get something wrong, we may correct it or
            cancel the order and tell you.
          </p>
        </ProseSection>
        <ProseSection title="Orders, shipping and returns" index="1.4">
          <p>
            Delivery and returns are covered in{' '}
            <Link href="/policies/shipping-returns" className={link}>
              Shipping &amp; Returns
            </Link>
            , which is part of these terms.
          </p>
        </ProseSection>
      </Panel>

      <Panel title="Privacy" index="02">
        <ProseSection title="What we collect" index="2.1">
          <ProseList
            items={[
              'Account details: your name, email address and password (stored securely).',
              'Order details: items, delivery addresses, shipping and payment method.',
              "Preferences kept in your own browser: your wishlist.",
            ]}
          />
        </ProseSection>
        <ProseSection title="How we use it" index="2.2">
          <ProseList
            items={[
              'To process, deliver and support your orders.',
              'To run your account and send emails you need, like confirmations and password resets.',
              'To keep the store secure and fix problems.',
            ]}
          />
          <p>We don&apos;t sell your personal information.</p>
        </ProseSection>
        <ProseSection title="Your choices" index="2.3">
          <p>
            You can update your details and addresses any time from{' '}
            <Link href="/account/profile" className={link}>
              your profile
            </Link>
            . To ask about or request deletion of your data,{' '}
            <Link href="/contact" className={link}>
              contact us
            </Link>
            .
          </p>
        </ProseSection>
      </Panel>
    </Reveal>
  );
}
