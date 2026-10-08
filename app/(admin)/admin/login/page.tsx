import { redirect } from 'next/navigation';

// Admins sign in through the same form as customers; requireAdmin() decides
// what they can see afterwards.
export default function AdminLoginPage() {
  redirect('/login?next=%2Fadmin');
}
