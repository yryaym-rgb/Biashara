import type { MineralId } from '@/lib/constants/minerals';
import {
  DIRECTORY_PUBLIC_ROLES,
  type DirectoryPublicProfile,
  type DirectoryPublicRole,
} from '@/lib/directory/constants';
import type { Database } from '@/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];
type KycStatus = Database['public']['Enums']['kyc_status'];

export function isDirectoryPublicRole(role: UserRole): role is DirectoryPublicRole {
  return (DIRECTORY_PUBLIC_ROLES as readonly UserRole[]).includes(role);
}

/**
 * Only KYC-approved, non-admin accounts in public directory roles appear in the Annuaire.
 */
export function isDirectoryEligibleProfile(profile: {
  role: UserRole;
  kyc_status: KycStatus;
}): boolean {
  if (profile.role === 'admin') {
    return false;
  }

  if (profile.kyc_status !== 'approved') {
    return false;
  }

  return isDirectoryPublicRole(profile.role);
}

export function collectDistinctMinerals(values: Array<MineralId | null | undefined>): MineralId[] {
  const seen = new Set<MineralId>();
  const minerals: MineralId[] = [];

  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    minerals.push(value);
  }

  return minerals;
}

export function pickPrimaryProvince(provinces: string[]): string | null {
  if (provinces.length === 0) {
    return null;
  }

  const counts = new Map<string, number>();
  for (const province of provinces) {
    counts.set(province, (counts.get(province) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? provinces[0] ?? null;
}

export function matchesDirectoryMineralFilter(
  profileMinerals: MineralId[],
  mineral?: MineralId,
): boolean {
  if (!mineral) {
    return true;
  }

  return profileMinerals.includes(mineral);
}

export function isPublicDirectoryProfile(
  profile: DirectoryPublicProfile | null | undefined,
): profile is DirectoryPublicProfile {
  return Boolean(profile && isDirectoryEligibleProfile(profile));
}
