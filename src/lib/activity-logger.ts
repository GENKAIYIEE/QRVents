import prisma from "./prisma"

/**
 * Write an audit entry to the ActivityLog table.
 * Call this inside every mutating server action so every admin action is traceable.
 *
 * @param userId   - The ID of the user performing the action
 * @param userName - The display name of the user
 * @param action   - Short action label  e.g. "Created Event", "Approved Proposal"
 * @param details  - Optional extra context (event title, email address, etc.)
 */
export async function logActivity(
  userId: string,
  userName: string,
  action: string,
  details?: string
) {
  try {
    await prisma.activityLog.create({
      data: { userId, userName, action, details },
    })
  } catch {
    // Non-fatal — never let logging break the main operation
  }
}
