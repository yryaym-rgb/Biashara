import { describe, it, expect } from 'vitest';
import {
  parseRegisterStep,
  buildRegisterStepUrl,
  REGISTER_STEPS,
} from '@/lib/auth/register-step';

describe('register step persistence', () => {
  it('defaults to step 1 for missing or invalid step param', () => {
    expect(parseRegisterStep(null)).toBe(1);
    expect(parseRegisterStep(undefined)).toBe(1);
    expect(parseRegisterStep('')).toBe(1);
    expect(parseRegisterStep('0')).toBe(1);
    expect(parseRegisterStep('4')).toBe(1);
    expect(parseRegisterStep('abc')).toBe(1);
  });

  it('parses valid step values 2 and 3', () => {
    expect(parseRegisterStep('2')).toBe(2);
    expect(parseRegisterStep('3')).toBe(3);
    expect(parseRegisterStep(['2'])).toBe(2);
  });

  it('builds URLs that preserve step in search params', () => {
    expect(buildRegisterStepUrl('/register', 1)).toBe('/register');
    expect(buildRegisterStepUrl('/register', 2)).toBe('/register?step=2');
    expect(buildRegisterStepUrl('/register', 3)).toBe('/register?step=3');
  });

  it('updates existing search params when changing step', () => {
    const existing = new URLSearchParams('foo=bar&step=2');
    expect(buildRegisterStepUrl('/register', 3, existing)).toBe('/register?foo=bar&step=3');
    expect(buildRegisterStepUrl('/register', 1, existing)).toBe('/register?foo=bar');
  });

  it('exposes exactly three registration steps', () => {
    expect(REGISTER_STEPS).toEqual([1, 2, 3]);
  });
});
