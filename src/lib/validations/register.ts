import { z } from "zod"

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string(),
    departmentId: z.string().min(1, "Department is required"),
    yearLevel: z.enum(["1", "2", "3", "4"], {
      message: "Year level is required",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      })
    }
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
