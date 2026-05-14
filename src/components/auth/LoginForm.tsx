"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { loginAction } from "@/app/(auth)/login/actions"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "rgba(255,255,255,0.1)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(255,255,255,0.2)",
  borderRadius: "6px",
  padding: "12px 16px",
  color: "#ffffff",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 150ms ease",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
}

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "rgba(252, 165, 165, 0.6)",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.15em",
  fontWeight: 600,
  color: "#dce1ff",
  marginBottom: "8px",
}

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    const result = await loginAction(values.email, values.password)
    if (result?.error) {
      setServerError(result.error)
    } else if (result?.redirectTo) {
      // Hard navigate so middleware picks up the new session cookie
      window.location.href = result.redirectTo
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* Email field */}
      <div>
        <label htmlFor="login-email" style={labelStyle}>
          USERNAME
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="admin@institution.edu"
          autoComplete="email"
          style={errors.email ? inputErrorStyle : inputStyle}
          {...register("email")}
        />
        {errors.email && (
          <p style={{ fontSize: "12px", color: "#fca5a5", marginTop: "4px", marginBottom: 0 }}>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password field */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <label htmlFor="login-password" style={{ ...labelStyle, marginBottom: 0 }}>
            PASSWORD
          </label>
          <a
            href="#"
            style={{
              fontSize: "11px",
              letterSpacing: "0.05em",
              fontWeight: 500,
              color: "#b5c4ff",
              textDecoration: "none",
            }}
          >
            Forget Password?
          </a>
        </div>
        <input
          id="login-password"
          type="password"
          placeholder="••••••••••••"
          autoComplete="current-password"
          style={errors.password ? inputErrorStyle : inputStyle}
          {...register("password")}
        />
        {errors.password && (
          <p style={{ fontSize: "12px", color: "#fca5a5", marginTop: "4px", marginBottom: 0 }}>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Server-level error */}
      {serverError && (
        <p
          style={{
            fontSize: "14px",
            color: "#fca5a5",
            fontWeight: 500,
            textAlign: "center",
            padding: "8px 0",
            margin: 0,
          }}
        >
          {serverError}
        </p>
      )}

      {/* Submit button */}
      <button
        id="login-submit"
        type="submit"
        disabled={isSubmitting}
        style={{
          width: "100%",
          fontWeight: 700,
          fontSize: "14px",
          letterSpacing: "0.05em",
          padding: "16px 32px",
          borderRadius: "6px",
          border: "none",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.7 : 1,
          backgroundColor: "#ffffff",
          color: "#00205B",
          transition: "background-color 150ms ease",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxSizing: "border-box",
        }}
      >
        {isSubmitting ? "Authenticating..." : "Authenticate"}
      </button>
    </form>
  )
}
