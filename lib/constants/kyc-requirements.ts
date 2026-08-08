/**
 * Required KYC documents per user role.
 * Justification: centralized mapping enforced by KYC approval logic — never scatter role checks.
 */

import type { Database } from '@/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];
type KycDocumentType = Database['public']['Enums']['kyc_document_type'];

/** Documents required for every role that can transact */
const BASE_REQUIRED: readonly KycDocumentType[] = ['id_card'] as const;

export const KYC_REQUIREMENTS: Record<
  UserRole,
  readonly KycDocumentType[]
> = {
  buyer: [...BASE_REQUIRED],
  institution: [...BASE_REQUIRED, 'business_registration'],
  seller: [...BASE_REQUIRED, 'business_registration'],
  cooperative: [...BASE_REQUIRED, 'business_registration', 'mining_permit'],
  admin: [],
};

export function getRequiredKycDocuments(role: UserRole): readonly KycDocumentType[] {
  return KYC_REQUIREMENTS[role];
}

export function hasAllRequiredKycDocuments(
  role: UserRole,
  approvedTypes: readonly KycDocumentType[],
): boolean {
  const required = getRequiredKycDocuments(role);
  return required.every((docType) => approvedTypes.includes(docType));
}

/** True when every required document type has a submitted row (any status). */
export function hasSubmittedAllRequiredKycDocuments(
  role: UserRole,
  submittedTypes: readonly KycDocumentType[],
): boolean {
  const required = getRequiredKycDocuments(role);
  return required.every((docType) => submittedTypes.includes(docType));
}
