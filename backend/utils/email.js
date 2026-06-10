const nodemailer = require('nodemailer')

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
})

async function sendEmail(toEmail, subject, html) {
  await transporter.sendMail({
    from: `QuizMaster <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject,
    html
  })
}

async function sendRegistrationOtp(toEmail, otp, name) {
  await sendEmail(toEmail, 'Verify your QuizMaster account', `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
      <h2 style="color: #4f46e5; margin-bottom: 8px;">Welcome, ${name}!</h2>
      <p style="color: #555; font-size: 15px; margin-bottom: 24px;">Use the OTP below to verify your email and complete registration.</p>
      <div style="background: #fff; border: 2px dashed #4f46e5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
      </div>
      <p style="color: #888; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      <p style="color: #aaa; font-size: 12px;">QuizMaster — Aditya University</p>
    </div>
  `)
}

async function sendPasswordResetOtp(toEmail, otp, name) {
  await sendEmail(toEmail, 'Your QuizMaster login OTP', `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
      <h2 style="color: #4f46e5; margin-bottom: 8px;">Hello, ${name}!</h2>
      <p style="color: #555; font-size: 15px; margin-bottom: 24px;">Use the OTP below to log in to your QuizMaster account.</p>
      <div style="background: #fff; border: 2px dashed #4f46e5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
      </div>
      <p style="color: #888; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>. If you did not request this, ignore this email.</p>
      <p style="color: #aaa; font-size: 12px;">QuizMaster — Aditya University</p>
    </div>
  `)
}

module.exports = { generateOtp, sendRegistrationOtp, sendPasswordResetOtp }