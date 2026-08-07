import { redirect } from 'next/navigation';
import { adminListingsModerationPath } from '@/lib/admin/path';

export default function AdminListingsModerationRedirect() {
  redirect(adminListingsModerationPath());
}
