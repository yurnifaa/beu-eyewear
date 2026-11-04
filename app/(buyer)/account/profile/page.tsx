import AccountHeader from '@/component/account/AccountHeader';
import ChangePasswordForm from '@/component/account/ChangePasswordForm';
import Panel from '@/component/account/Panel';
import ProfileForm from '@/component/account/ProfileForm';
import VerificationCard from '@/component/account/VerificationCard';
import { requireUser } from '@/lib/auth/session';

export default async function ProfilePage() {
  // Checked here rather than in account/layout.tsx so /account/wishlist
  // (localStorage-backed) stays usable without signing in.
  const user = await requireUser('/account/profile');

  return (
    <div className="flex flex-col gap-8">
      <AccountHeader
        eyebrow="Profile"
        title="Your details"
        description="Update your details, verify your email and change your password."
      />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Panel id="details" title="Your details" index="01">
            <ProfileForm name={user.name} email={user.email} />
          </Panel>
          <Panel id="verify" title="Email verification" index="02">
            <VerificationCard email={user.email} verified={Boolean(user.emailVerifiedAt)} />
          </Panel>
        </div>

        <Panel id="password" title="Change password" index="03">
          <ChangePasswordForm />
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Changing your password signs you out of your other devices.
          </p>
        </Panel>
      </div>
    </div>
  );
}
