import 'server-only';

import { cookies } from 'next/headers';
import { getProfile, getUser } from '@/lib/auth/session';
import type { Database } from '@/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];

const REGISTRATION_USER_COOKIE = 'biashara_reg_uid';
const REGISTRATION_ROLE_COOKIE = 'biashara_reg_role';

const REGISTER_ROLES: readonly UserRole[] = [
  'buyer',
  'seller',
  'cooperative',
  'institution',
];

function isRegisterRole(value: string): value is UserRole {
  return (REGISTER_ROLES as readonly string[]).includes(value);
}

export interface RegistrationContext {
  userId: string;
  role: UserRole;
}

export async function setRegistrationCookies(userId: string, role: UserRole) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24,
    path: '/',
  };

  cookieStore.set(REGISTRATION_USER_COOKIE, userId, options);
  cookieStore.set(REGISTRATION_ROLE_COOKIE, role, options);
}

export async function clearRegistrationCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(REGISTRATION_USER_COOKIE);
  cookieStore.delete(REGISTRATION_ROLE_COOKIE);
}

export async function getRegistrationContext(): Promise<RegistrationContext | null> {
  const profile = await getProfile();
  if (profile) {
    return { userId: profile.id, role: profile.role };
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get(REGISTRATION_USER_COOKIE)?.value;
  const role = cookieStore.get(REGISTRATION_ROLE_COOKIE)?.value;

  if (userId && role && isRegisterRole(role)) {
    return { userId, role };
  }

  return null;
}
