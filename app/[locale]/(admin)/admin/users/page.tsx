import { redirect } from 'next/navigation';
import { adminUsersPath } from '@/lib/admin/path';

export default function AdminUsersRedirect() {
  redirect(adminUsersPath());
}
