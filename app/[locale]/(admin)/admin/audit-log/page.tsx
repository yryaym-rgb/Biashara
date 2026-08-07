import { redirect } from 'next/navigation';
import { adminAuditLogPath } from '@/lib/admin/path';

export default function AdminAuditLogRedirect() {
  redirect(adminAuditLogPath());
}
