import { z } from "zod"

export const registerAdminSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["DEPT_ADMIN", "SUPER_ADMIN"]),
    departmentId: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      })
    }
    if (data.role === "DEPT_ADMIN" && (!data.departmentId || data.departmentId === "")) {
      ctx.addIssue({
        code: "custom",
        path: ["departmentId"],
        message: "Department is required for Department Admins",
      })
    }
  })

export type RegisterAdminFormValues = z.infer<typeof registerAdminSchema>
