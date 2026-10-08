// Creates (or promotes) the admin account used to sign in to /admin.
// Usage: set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then run `npm run admin:create`.
// Safe to re-run: an existing user with that email is promoted to ADMIN and
// keeps their current password.
import 'dotenv/config';
import { hashPassword } from '../lib/auth/password';
import { prisma } from '../lib/prisma';

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.');
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters.');
  }

  await prisma.user.upsert({
    where: { email },
    create: { email, name: 'BeU Admin', passwordHash: await hashPassword(password), role: 'ADMIN' },
    update: { role: 'ADMIN' },
  });
  console.log(`Admin ready: ${email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
