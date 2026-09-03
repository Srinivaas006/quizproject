const https = require('https')
const nodemailer = require('nodemailer')

// ─── Startup diagnostics ──────────────────────────────────────────────────────
if (!process.env.BREVO_API_KEY) {
  console.error('[email] WARNING: BREVO_API_KEY is not set — OTP emails will fail!')
}
if (!process.env.SENDER_EMAIL) {
  console.warn('[email] WARNING: SENDER_EMAIL not set — falling back to ajaybob451@gmail.com')
  console.warn('[email]   Brevo requires this address to be a verified sender in your account.')
  console.warn('[email]   Go to: https://app.brevo.com/senders/list and verify it.')
}
// ─────────────────────────────────────────────────────────────────────────────

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send via Brevo transactional email API.
 * SENDER_EMAIL must be verified in your Brevo account:
 *   https://app.brevo.com/senders/list
 */
async function sendViaBrevo(toEmail, toName, subject, html) {
  const senderEmail = process.env.SENDER_EMAIL || 'ajaybob451@gmail.com'
  const senderName  = process.env.SENDER_NAME  || 'QuizMaster'

  const body = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: toName }],
    subject,
    htmlContent: html
  })

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'Content-Length': Buffer.byteLength(body)   // byte-length, not char-length
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[email] Brevo sent OK to ${toEmail}`)
          resolve(data)
        } else {
          // Log the FULL Brevo error — this is what was hidden before
          console.error(`[email] Brevo HTTP ${res.statusCode}: ${data}`)
          reject(new Error(`Brevo error ${res.statusCode}: ${data}`))
        }
      })
    })
    req.on('error', (err) => {
      console.error('[email] Brevo network error:', err.message)
      reject(err)
    })
    req.write(body)
    req.end()
  })
}

/**
 * Fallback: send via Gmail SMTP using nodemailer.
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD in .env
 * (App Password, NOT your Gmail login password — create at
 *   https://myaccount.google.com/apppasswords  with 2FA enabled)
 */
async function sendViaGmail(toEmail, toName, subject, html) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  })

  const info = await transporter.sendMail({
    from: `"${process.env.SENDER_NAME || 'QuizMaster'}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject,
    html
  })
  console.log(`[email] Gmail sent OK to ${toEmail} — messageId: ${info.messageId}`)
  return info
}

/**
 * Main send function.
 * Tries Brevo first. If BREVO_API_KEY is missing or Brevo fails,
 * falls back to Gmail SMTP (if GMAIL_USER + GMAIL_APP_PASSWORD are set).
 */
async function sendEmail(toEmail, toName, subject, html) {
  // --- Brevo path ---
  if (process.env.BREVO_API_KEY) {
    try {
      await sendViaBrevo(toEmail, toName, subject, html)
      return
    } catch (err) {
      console.error('[email] Brevo failed, checking Gmail fallback...', err.message)
    }
  }

  // --- Gmail fallback path ---
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.warn('[email] Using Gmail SMTP fallback.')
    await sendViaGmail(toEmail, toName, subject, html)
    return
  }

  // --- Nothing configured ---
  throw new Error(
    'No email provider configured. Set BREVO_API_KEY (and verify sender in Brevo dashboard) ' +
    'or set GMAIL_USER + GMAIL_APP_PASSWORD for Gmail SMTP fallback.'
  )
}

// ─── OTP email templates ──────────────────────────────────────────────────────

async function sendRegistrationOtp(toEmail, otp, name) {
  await sendEmail(toEmail, name, 'Verify your QuizMaster account', `
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
  await sendEmail(toEmail, name, 'Your QuizMaster login OTP', `
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