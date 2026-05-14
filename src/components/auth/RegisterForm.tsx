"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerAction } from "@/app/(auth)/register/actions"
import { registerSchema, type RegisterFormValues } from "@/lib/validations/register"

type Department = {
  id: string
  name: string
  code: string
}

type RegisterFormProps = {
  departments: Department[]
}

const getPasswordStrength = (pwd: string): { score: number; label: string } => {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const labels = ["", "Weak", "Fair", "Good", "Strong"]
  return { score, label: labels[score] || "" }
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  lineHeight: 1,
  letterSpacing: "0.05em",
  fontWeight: 600,
  color: "#444652",
  marginBottom: "8px",
  fontFamily: "'Inter', sans-serif",
}

const errorTextStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "12px",
  lineHeight: 1.5,
  color: "#ba1a1a",
  margin: "8px 0 0 0",
  fontFamily: "'Inter', sans-serif",
}

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#ffffff",
  border: "1px solid #c4c5d3",
  borderRadius: "6px",
  padding: "12px 16px",
  color: "#0b1c30",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
}

export default function RegisterForm({ departments }: RegisterFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      departmentId: "",
      yearLevel: undefined,
    },
    mode: "onChange",
  })

  const passwordValue = watch("password") || ""
  const confirmPasswordValue = watch("confirmPassword") || ""

  const strength = getPasswordStrength(passwordValue)

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    const result = await registerAction(values)
    if (result?.error) {
      setServerError(result.error)
    }
  }

  const getInputStyle = (fieldName: string, hasError: boolean, isValid: boolean) => {
    const isFocused = focusedField === fieldName
    let borderColor = "#c4c5d3"
    let boxShadow = "none"

    if (hasError) {
      borderColor = "#ba1a1a"
      if (isFocused) boxShadow = "0 0 0 1px #ba1a1a"
    } else if (isValid) {
      borderColor = "#059669"
      if (isFocused) boxShadow = "0 0 0 1px #059669"
    } else if (isFocused) {
      borderColor = "#00236f"
      boxShadow = "0 0 0 1px #00236f"
    }

    return { ...baseInputStyle, borderColor, boxShadow }
  }

  const emailHasError = touchedFields.email && !!errors.email
  const confirmHasError = touchedFields.confirmPassword && !!errors.confirmPassword
  const confirmIsValid =
    !confirmHasError &&
    touchedFields.confirmPassword &&
    confirmPasswordValue.length > 0 &&
    confirmPasswordValue === passwordValue &&
    !errors.confirmPassword

  return (
    <div style={{ padding: "32px" }}>
      {serverError && (
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            backgroundColor: "rgba(186, 26, 26, 0.1)",
            border: "1px solid rgba(186, 26, 26, 0.2)",
            borderRadius: "6px",
            color: "#ba1a1a",
            fontSize: "14px",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" style={labelStyle}>
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Juan Dela Cruz"
            style={getInputStyle("fullName", !!errors.fullName, false)}
            {...register("fullName")}
            onFocus={(e) => { register("fullName").onBlur(e); setFocusedField("fullName") }}
            onBlur={(e) => { register("fullName").onBlur(e); setFocusedField(null) }}
          />
          {errors.fullName && <p style={errorTextStyle}>{errors.fullName.message}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" style={labelStyle}>
            Email Address
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              style={getInputStyle("email", emailHasError ?? false, false)}
              {...register("email")}
              onFocus={(e) => { register("email").onBlur(e); setFocusedField("email") }}
              onBlur={(e) => { register("email").onBlur(e); setFocusedField(null) }}
            />
            {emailHasError && (
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, display: "flex", alignItems: "center", paddingRight: "12px", pointerEvents: "none" }}>
                <span className="material-symbols-outlined" style={{ color: "#ba1a1a", fontSize: "20px" }}>error</span>
              </div>
            )}
          </div>
          {errors.email && <p style={errorTextStyle}>{errors.email.message}</p>}
        </div>

        {/* Department & Year Level */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label htmlFor="departmentId" style={labelStyle}>
              Department
            </label>
            <div style={{ position: "relative" }}>
              <select
                id="departmentId"
                style={{ ...getInputStyle("departmentId", !!errors.departmentId, false), appearance: "none", cursor: "pointer", paddingRight: "40px" }}
                {...register("departmentId")}
                onFocus={(e) => { register("departmentId").onBlur(e); setFocusedField("departmentId") }}
                onBlur={(e) => { register("departmentId").onBlur(e); setFocusedField(null) }}
              >
                <option value="" disabled>Select</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code}</option>
                ))}
              </select>
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, display: "flex", alignItems: "center", paddingRight: "12px", pointerEvents: "none" }}>
                <span className="material-symbols-outlined" style={{ color: "#757683", fontSize: "20px" }}>expand_more</span>
              </div>
            </div>
            {errors.departmentId && <p style={errorTextStyle}>{errors.departmentId.message}</p>}
          </div>

          <div>
            <label htmlFor="yearLevel" style={labelStyle}>
              Year Level
            </label>
            <div style={{ position: "relative" }}>
              <select
                id="yearLevel"
                style={{ ...getInputStyle("yearLevel", !!errors.yearLevel, false), appearance: "none", cursor: "pointer", paddingRight: "40px" }}
                {...register("yearLevel")}
                onFocus={(e) => { register("yearLevel").onBlur(e); setFocusedField("yearLevel") }}
                onBlur={(e) => { register("yearLevel").onBlur(e); setFocusedField(null) }}
              >
                <option value="" disabled>Select</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, display: "flex", alignItems: "center", paddingRight: "12px", pointerEvents: "none" }}>
                <span className="material-symbols-outlined" style={{ color: "#757683", fontSize: "20px" }}>expand_more</span>
              </div>
            </div>
            {errors.yearLevel && <p style={errorTextStyle}>{errors.yearLevel.message}</p>}
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" style={labelStyle}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              style={getInputStyle("password", !!errors.password, false)}
              {...register("password")}
              onFocus={(e) => { register("password").onBlur(e); setFocusedField("password") }}
              onBlur={(e) => { register("password").onBlur(e); setFocusedField(null) }}
            />
          </div>
          {errors.password && <p style={errorTextStyle}>{errors.password.message}</p>}

          <div style={{ marginTop: "8px", display: "flex", gap: "4px", height: "6px", width: "100%", borderRadius: "9999px", overflow: "hidden", backgroundColor: "#d3e4fe" }}>
            <div style={{ height: "100%", width: "25%", transition: "background-color 0.2s", backgroundColor: strength.score >= 1 ? "#ba1a1a" : "transparent" }} />
            <div style={{ height: "100%", width: "25%", transition: "background-color 0.2s", backgroundColor: strength.score >= 2 ? "#f59e0b" : "transparent" }} />
            <div style={{ height: "100%", width: "25%", transition: "background-color 0.2s", backgroundColor: strength.score >= 3 ? "#10b981" : "transparent" }} />
            <div style={{ height: "100%", width: "25%", transition: "background-color 0.2s", backgroundColor: strength.score >= 4 ? "#059669" : "transparent" }} />
          </div>
          <p style={{ marginTop: "6px", fontSize: "12px", lineHeight: 1.5, color: "#444652", textAlign: "right", margin: "6px 0 0 0", fontFamily: "'Inter', sans-serif" }}>
            {strength.label}
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" style={labelStyle}>
            Confirm Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              style={getInputStyle("confirmPassword", confirmHasError ?? false, confirmIsValid ?? false)}
              {...register("confirmPassword")}
              onFocus={(e) => { register("confirmPassword").onBlur(e); setFocusedField("confirmPassword") }}
              onBlur={(e) => { register("confirmPassword").onBlur(e); setFocusedField(null) }}
            />
            {confirmHasError && (
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, display: "flex", alignItems: "center", paddingRight: "12px", pointerEvents: "none" }}>
                <span className="material-symbols-outlined" style={{ color: "#ba1a1a", fontSize: "20px" }}>error</span>
              </div>
            )}
            {confirmIsValid && (
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, display: "flex", alignItems: "center", paddingRight: "12px", pointerEvents: "none" }}>
                <span className="material-symbols-outlined" style={{ color: "#059669", fontSize: "20px" }}>check_circle</span>
              </div>
            )}
          </div>
          {errors.confirmPassword && <p style={errorTextStyle}>{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            marginTop: "32px",
            backgroundColor: "#00236f",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "16px",
            padding: "14px 24px",
            borderRadius: "6px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            transition: "background-color 0.2s, opacity 0.2s",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxSizing: "border-box",
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = isSubmitting ? "#00236f" : "rgba(0, 35, 111, 0.9)"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#00236f"}
        >
          {isSubmitting ? (
            "Creating Account..."
          ) : (
            <>
              Create Account & Get My QR Code
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_forward</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
