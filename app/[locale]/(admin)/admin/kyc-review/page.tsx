import { redirect } from 'next/navigation';
import { adminKycReviewPath } from '@/lib/admin/path';

export default function AdminKycRedirect() {
  redirect(adminKycReviewPath());
}
