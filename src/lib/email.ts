import nodemailer from "nodemailer"

// ─── Transporter ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM_ADDRESS,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

// ─── Send OTP Email ───────────────────────────────────────────────────────────
export async function sendOtpEmail(
  toEmail: string,
  toName: string,
  otp: string
) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "QRVents"
  const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "Polytechnic College of La Union"
  const fromAddress = process.env.EMAIL_FROM_ADDRESS ?? ""

  // Split OTP into individual digits for the styled boxes
  const otpDigits = otp.split("").map(
    (d) => `<td style="padding:0 4px;">
      <div style="width:48px;height:60px;background:#F8FAFC;border:2px solid #E2E8F0;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#0F172A;text-align:center;line-height:60px;">${d}</div>
    </td>`
  ).join("")

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your OTP — ${appName}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F1E45 0%,#1A3A8F 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">${appName}</p>
              <p style="margin:6px 0 0;color:#93C5FD;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">${schoolName}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;color:#64748B;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Password Reset OTP</p>
              <h1 style="margin:0 0 16px;color:#0F172A;font-size:22px;font-weight:700;">Hi ${toName},</h1>
              <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.7;">
                Use the 6-digit OTP below to reset your <strong>${appName}</strong> password.
                This code expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP Boxes -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  ${otpDigits}
                </tr>
              </table>

              <!-- Expiry notice -->
              <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:10px;padding:14px 18px;margin-bottom:24px;text-align:center;">
                <p style="margin:0;color:#92400E;font-size:13px;font-weight:600;">
                  ⏱️ &nbsp;This OTP expires in <strong>10 minutes</strong>
                </p>
              </div>

              <!-- Security Notice -->
              <div style="border-left:3px solid #FBBF24;padding:12px 16px;background:#FFFBEB;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <p style="margin:0;color:#92400E;font-size:13px;line-height:1.6;">
                  <strong>Didn't request this?</strong> Ignore this email — your password remains unchanged.
                  If you didn't request this, contact your system administrator.
                </p>
              </div>

              <p style="margin:0;color:#94A3B8;font-size:13px;">
                For security, this OTP can only be used <strong>once</strong> and expires after <strong>10 minutes</strong>.
                Do not share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#94A3B8;font-size:12px;">
                &copy; ${new Date().getFullYear()} ${appName} &mdash; ${schoolName}
              </p>
              <p style="margin:6px 0 0;color:#CBD5E1;font-size:11px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const text = `
Hi ${toName},

Your ${appName} password reset OTP is:

  ${otp}

This code expires in 10 minutes and can only be used once.

If you didn't request this, please ignore this email.

— ${appName} Team
`.trim()

  await transporter.sendMail({
    from: `"${appName}" <${fromAddress}>`,
    to: toEmail,
    subject: `${otp} — Your ${appName} Password Reset OTP`,
    text,
    html,
  })
}
