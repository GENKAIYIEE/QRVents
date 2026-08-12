// Quick test to verify Nodemailer Gmail connection
// Run: node test-email.js

require("dotenv").config()
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM_ADDRESS,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

async function test() {
  console.log("📧 Testing Gmail SMTP connection...")
  console.log("   From:", process.env.EMAIL_FROM_ADDRESS)

  try {
    // Verify connection
    await transporter.verify()
    console.log("✅ SMTP connection verified! Gmail is ready.")

    // Send a test email to the same address
    const info = await transporter.sendMail({
      from: `"QRVents" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: process.env.EMAIL_FROM_ADDRESS, // send to itself as a test
      subject: "✅ QRVents Email Test",
      text: "Nodemailer is working correctly for QRVents!",
      html: "<p><strong>✅ Nodemailer is working correctly for QRVents!</strong></p><p>Your forgot-password email system is ready.</p>",
    })

    console.log("✅ Test email sent successfully!")
    console.log("   Message ID:", info.messageId)
    console.log(`   Check the inbox of: ${process.env.EMAIL_FROM_ADDRESS}`)
  } catch (err) {
    console.error("❌ Email test FAILED:")
    console.error("  ", err.message)
    console.log("\n💡 Common fixes:")
    console.log("   1. Make sure 2-Step Verification is enabled on the Gmail account")
    console.log("   2. Make sure the App Password is correct (16 chars)")
    console.log("   3. Make sure 'Less secure app access' is NOT blocking (App Password bypasses this)")
  }
}

test()
