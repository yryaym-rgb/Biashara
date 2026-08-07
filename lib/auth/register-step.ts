/**
 * Register stepper URL persistence helpers.
 * Justification: refresh must not lose progress — step lives in ?step=N.
 */

export const REGISTER_STEPS = [1, 2, 3] as const;
export type RegisterStep = (typeof REGISTER_STEPS)[number];

const STEP_PARAM = 'step';

export function parseRegisterStep(
  value: string | string[] | null | undefined,
): RegisterStep {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (parsed === 2 || parsed === 3) {
    return parsed;
  }
  return 1;
}

export function buildRegisterStepUrl(
  pathname: string,
  step: RegisterStep,
  existingParams?: URLSearchParams,
): string {
  const params = new URLSearchParams(existingParams?.toString());
  if (step === 1) {
    params.delete(STEP_PARAM);
  } else {
    params.set(STEP_PARAM, String(step));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
