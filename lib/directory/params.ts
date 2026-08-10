import { z } from 'zod';
import { MINERAL_IDS } from '@/lib/constants/minerals';
import { PROFILE_COUNTRY_CODES } from '@/lib/constants/countries';
import { DIRECTORY_PUBLIC_ROLES } from '@/lib/directory/constants';

export const directorySearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  q: z.string().max(200).optional(),
  role: z.enum(DIRECTORY_PUBLIC_ROLES).optional(),
  mineral: z.enum(MINERAL_IDS as unknown as [string, ...string[]]).optional(),
  country: z.enum(PROFILE_COUNTRY_CODES).optional(),
});

export type DirectorySearchParams = z.infer<typeof directorySearchParamsSchema>;

export function parseDirectorySearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): DirectorySearchParams {
  const raw = {
    page: searchParams.page,
    q: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    role: typeof searchParams.role === 'string' ? searchParams.role : undefined,
    mineral: typeof searchParams.mineral === 'string' ? searchParams.mineral : undefined,
    country: typeof searchParams.country === 'string' ? searchParams.country : undefined,
  };

  return directorySearchParamsSchema.parse(raw);
}
