/**
 * Gate for the 建联提报 review (审核) action — "仅限特定人员操作".
 *
 * The real permission model is not wired up yet, so this stub currently grants
 * access to everyone so the review UI can be exercised. When roles/permissions
 * are introduced, switch `canReview` to a role check, e.g.:
 *
 *   const role = useAuthStore((s) => s.auth.user?.role ?? [])
 *   const canReview = role.some((r) => REVIEWER_ROLES.includes(r))
 */

/** Roles permitted to perform 提报审核 once the permission model exists. */
export const REVIEWER_ROLES = ['admin', 'auditor', 'reviewer'] as const

export function useReviewPermission(): { canReview: boolean } {
  // TODO(permissions): replace with a real role check when the permission
  // model is introduced. Defaulting to `true` for now (frontend-only).
  return { canReview: true }
}
