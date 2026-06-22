import { z } from "zod"

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  venue: z.string().min(3, "Venue must be at least 3 characters"),
  eventType: z.enum(["SCHOOL_WIDE", "DEPARTMENT"]),
  departmentId: z.preprocess((val) => val === "" ? null : val, z.string().optional().nullable()),
  expectedAttendees: z.preprocess(
    (val) => (val === "" || val == null) ? null : Number(val),
    z.number().min(1, "Must expect at least 1 attendee").optional().nullable()
  ),
}).refine(
  (data) => {
    // If it's a department event, departmentId must be provided
    if (data.eventType === "DEPARTMENT" && !data.departmentId) {
      return false;
    }
    return true;
  },
  {
    message: "Department is required for department events",
    path: ["departmentId"],
  }
)

export type EventFormValues = z.infer<typeof eventSchema>
