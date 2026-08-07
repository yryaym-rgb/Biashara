import 'server-only';
import { getProfile } from '@/lib/auth/session';
import { requireRole } from '@/lib/rbac';

/** Page-level admin guard — call at the top of every admin page. */
export async function requireAdminPage() {
  return requireRole(await getProfile(), ['admin']);
}
