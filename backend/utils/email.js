const https = require('https')

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendEmail(toEmail, toName, subject, html) {
  const body = JSON.stringify({
    sender: { name: 'QuizMaster', email: 'ajaybob451@gmail.com' },
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
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(new Error(`Brevo error ${res.statusCode}: ${data}`))
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

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