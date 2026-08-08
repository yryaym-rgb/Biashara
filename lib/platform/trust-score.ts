import type { Database } from '@/types/database.types';

type KycStatus = Database['public']['Enums']['kyc_status'];

export interface TrustScoreSignals {
  kycApproved: boolean;
  completedOrderCount: number;
  disputedOrderCount: number;
  accountAgeDays: number;
}

export interface TrustScoreSignalItem {
  key: 'kycApproved' | 'completedOrders' | 'disputedOrders' | 'accountAge';
  met: boolean;
  value: number | boolean;
}

export interface TrustScoreResult {
  score: number;
  signals: TrustScoreSignalItem[];
}

/**
 * Trust Score formula (0–100):
 *
 *   score = clamp(
 *     (kycApproved ? 30 : 0)
 *     + min(30, completedOrderCount × 6)
 *     + min(25, floor(accountAgeDays / 30) × 5)
 *     − disputedOrderCount × 15,
 *     0, 100
 *   )
 *
 * Signals:
 *   - KYC approved: +30 when profile.kyc_status === 'approved'
 *   - Completed orders: +6 per delivered order, capped at +30
 *   - Account age: +5 per full 30-day period since profile.created_at, capped at +25
 *   - Disputed orders: −15 per order with status 'disputed'
 */
export function computeTrustScore(signals: TrustScoreSignals): TrustScoreResult {
  const kycPoints = signals.kycApproved ? 30 : 0;
  const completedPoints = Math.min(30, signals.completedOrderCount * 6);
  const agePeriods = Math.floor(signals.accountAgeDays / 30);
  const agePoints = Math.min(25, agePeriods * 5);
  const disputePenalty = signals.disputedOrderCount * 15;

  const raw = kycPoints + completedPoints + agePoints - disputePenalty;
  const score = Math.max(0, Math.min(100, raw));

  const signalItems: TrustScoreSignalItem[] = [
    {
      key: 'kycApproved',
      met: signals.kycApproved,
      value: signals.kycApproved,
    },
    {
      key: 'completedOrders',
      met: signals.completedOrderCount > 0,
      value: signals.completedOrderCount,
    },
    {
      key: 'disputedOrders',
      met: signals.disputedOrderCount === 0,
      value: signals.disputedOrderCount,
    },
    {
      key: 'accountAge',
      met: signals.accountAgeDays >= 30,
      value: signals.accountAgeDays,
    },
  ];

  return { score, signals: signalItems };
}

export function accountAgeDays(createdAt: string, now: Date = new Date()): number {
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function isKycApprovedForTrust(kycStatus: KycStatus): boolean {
  return kycStatus === 'approved';
}
