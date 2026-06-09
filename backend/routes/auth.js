const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const User = require('../models/User')
const { generateOtp, sendRegistrationOtp, sendPasswordResetOtp } = require('../utils/email')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
})

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
})

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function makeToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// STEP 1: Send OTP to email
router.post('/register/init', otpLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || typeof name !== 'string' || name.trim().length < 2)
      return res.status(400).json({ error: 'Name must be at least 2 characters' })
    if (!email || !isValidEmail(email.trim()))
      return res.status(400).json({ error: 'Valid email is required' })
    if (!password || password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const existing = await User.findOne({ email: email.trim().toLowerCase() })
    if (existing && existing.isVerified)
      return res.status(400).json({ error: 'Email already registered. Please login.' })

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    const hashed = await bcrypt.hash(password, 10)

    if (existing && !existing.isVerified) {
      existing.name = name.trim()
      existing.passwordHash = hashed
      existing.emailOtp = otp
      existing.emailOtpExpiry = otpExpiry
      await existing.save()
    } else {
      await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: hashed,
        role: 'admin',
        isVerified: false,
        emailOtp: otp,
        emailOtpExpiry: otpExpiry
      })
    }

    await sendRegistrationOtp(email.trim().toLowerCase(), otp, name.trim())
    res.json({ message: 'OTP sent to your email. Please verify to complete registration.' })
  } catch (e) {
    console.error('register/init error', e)
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' })
  }
})

// STEP 2: Verify OTP and complete registration
router.post('/register/verify', authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp)
      return res.status(400).json({ error: 'Email and OTP are required' })

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user || user.isVerified)
      return res.status(400).json({ error: 'Invalid request. Please register again.' })
    if (!user.emailOtp || user.emailOtp !== otp.toString())
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' })
    if (new Date() > user.emailOtpExpiry)
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' })

    user.isVerified = true
    user.emailOtp = null
    user.emailOtpExpiry = null
    await user.save()

    res.json({ token: makeToken(user), message: 'Registration successful!' })
  } catch (e) {
    console.error('register/verify error', e)
    res.status(500).json({ error: 'Verification failed. Please try again.' })
  }
})

// Resend registration OTP
router.post('/register/resend', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user || user.isVerified)
      return res.status(400).json({ error: 'No pending registration for this email.' })

    const otp = generateOtp()
    user.emailOtp = otp
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendRegistrationOtp(email.trim().toLowerCase(), otp, user.name)
    res.json({ message: 'New OTP sent to your email.' })
  } catch (e) {
    console.error('register/resend error', e)
    res.status(500).json({ error: 'Failed to resend OTP.' })
  }
})

// Normal password login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !isValidEmail(email.trim()))
      return res.status(400).json({ error: 'Valid email is required' })
    if (!password || typeof password !== 'string')
      return res.status(400).json({ error: 'Password is required' })

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })
    if (!user.isVerified)
      return res.status(400).json({ error: 'Email not verified. Please complete registration.' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' })

    res.json({ token: makeToken(user) })
  } catch (e) {
    console.error('login error', e)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Forgot password — send OTP
router.post('/forgot-password', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body
    if (!email || !isValidEmail(email.trim()))
      return res.status(400).json({ error: 'Valid email is required' })

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user || !user.isVerified)
      return res.json({ message: 'If this email is registered, an OTP has been sent.' })

    const otp = generateOtp()
    user.resetOtp = otp
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendPasswordResetOtp(email.trim().toLowerCase(), otp, user.name)
    res.json({ message: 'OTP sent to your email.' })
  } catch (e) {
    console.error('forgot-password error', e)
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' })
  }
})

// Forgot password — verify OTP and login
router.post('/forgot-password/verify', authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp)
      return res.status(400).json({ error: 'Email and OTP are required' })

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user || !user.isVerified)
      return res.status(400).json({ error: 'Invalid request.' })
    if (!user.resetOtp || user.resetOtp !== otp.toString())
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' })
    if (new Date() > user.resetOtpExpiry)
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' })

    user.resetOtp = null
    user.resetOtpExpiry = null
    await user.save()

    res.json({ token: makeToken(user), message: 'OTP verified. Logged in successfully!' })
  } catch (e) {
    console.error('forgot-password/verify error', e)
    res.status(500).json({ error: 'Verification failed.' })
  }
})

module.exports = router