import prisma from "./prisma"

export type NotificationType =
  | "PROPOSAL_SUBMITTED"
  | "PROPOSAL_APPROVED"
  | "PROPOSAL_REJECTED"
  | "PROPOSAL_ON_HOLD"
  | "EVENT_CREATED"
  | "EVENT_UPDATED"
  | "EVENT_CANCELLED"
  | "ATTENDANCE_RECORDED"
  | "SYSTEM"

interface CreateNotificationOptions {
  userId: string
  title: string
  message: string
  type: NotificationType
}

/**
 * Create a notification for a single user.
 * Non-fatal — never lets notification creation break the main operation.
 */
export async function createNotification(options: CreateNotificationOptions) {
  try {
    await prisma.notification.create({
      data: {
        userId: options.userId,
        title: options.title,
        message: options.message,
        type: options.type,
      },
    })
  } catch {
    // Never let notification creation fail the parent operation
  }
}

/**
 * Create the same notification for multiple users at once.
 */
export async function createNotificationsForMany(
  userIds: string[],
  options: Omit<CreateNotificationOptions, "userId">
) {
  if (userIds.length === 0) return
  try {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: options.title,
        message: options.message,
        type: options.type,
      })),
    })
  } catch {
    // Non-fatal
  }
}

/**
 * Notify all department admins about a proposal status change.
 */
export async function notifyProposalStatusChange(
  proposalId: string,
  status: "APPROVED" | "REJECTED" | "ON_HOLD",
  deptAdminId: string
) {
  const titleMap = {
    APPROVED: "Proposal Approved ✅",
    REJECTED: "Proposal Rejected ❌",
    ON_HOLD: "Proposal Put On Hold ⏸️",
  }
  const messageMap = {
    APPROVED: "Your event proposal has been approved by the administration.",
    REJECTED: "Your event proposal was reviewed and rejected.",
    ON_HOLD: "Your event proposal is currently on hold pending further review.",
  }

  await createNotification({
    userId: deptAdminId,
    title: titleMap[status],
    message: messageMap[status],
    type: `PROPOSAL_${status}` as NotificationType,
  })
}
