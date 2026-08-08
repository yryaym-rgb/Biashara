import type { Database } from '@/types/database.types';
import { hasSubmittedAllRequiredKycDocuments } from '@/lib/constants/kyc-requirements';
import type { RegisterStep } from '@/lib/auth/register-step';
import type { RegistrationContext } from '@/lib/auth/registration';

type KycDocumentType = Database['public']['Enums']['kyc_document_type'];

export interface RegisterStepGateResult {
  allowed: boolean;
  redirectStep?: RegisterStep;
}

/**
 * Server-side gate for register step URL params.
 * Step 3 requires all required KYC documents submitted for the user's role.
 */
export function evaluateRegisterStepGate(
  requestedStep: RegisterStep,
  context: RegistrationContext | null,
  submittedTypes: readonly KycDocumentType[],
): RegisterStepGateResult {
  if (requestedStep < 2) {
    return { allowed: true };
  }

  if (!context) {
    return { allowed: false, redirectStep: 1 };
  }

  if (
    requestedStep === 3 &&
    !hasSubmittedAllRequiredKycDocuments(context.role, submittedTypes)
  ) {
    return { allowed: false, redirectStep: 2 };
  }

  return { allowed: true };
}
