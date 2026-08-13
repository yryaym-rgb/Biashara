export interface KycFunnelCounts {
  pending: number;
  needsReview: number;
  verified: number;
  rejected: number;
  total: number;
  verifiedPercent: number;
}

export interface OldestPendingKycRow {
  id: string;
  userId: string;
  companyName: string | null;
  submittedAt: string;
}

export function computeKycFunnelCounts(input: {
  pending: number;
  approved: number;
  rejected: number;
  needsReview: number;
}): KycFunnelCounts {
  const total = input.pending + input.approved + input.rejected;
  const verifiedPercent = total > 0 ? Math.round((input.approved / total) * 100) : 0;

  return {
    pending: input.pending,
    needsReview: input.needsReview,
    verified: input.approved,
    rejected: input.rejected,
    total,
    verifiedPercent,
  };
}

export function countNeedsReviewUsers(
  pendingUserIds: string[],
  rejectedUserIds: string[],
): number {
  const rejectedSet = new Set(rejectedUserIds);
  const needsReviewUsers = new Set<string>();

  for (const userId of pendingUserIds) {
    if (rejectedSet.has(userId)) {
      needsReviewUsers.add(userId);
    }
  }

  return needsReviewUsers.size;
}
