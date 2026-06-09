const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const User = require('../models/User')

// Rate limiter — max 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
})

// Simple validator helper
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' })
    }
    if (!email || !isValidEmail(email.trim())) {
      return res.status(400).json({ error: 'Valid email is required' })
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() })
    if (existing) return res.status(400).json({ error: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const u = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashed,
      role: 'admin'
    })
    await u.save()

    const tok = jwt.sign(
      { id: u._id, role: u.role, name: u.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token: tok })
  } catch (e) {
    console.log('register error', e)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    // Input validation
    if (!email || !isValidEmail(email.trim())) {
      return res.status(400).json({ error: 'Valid email is required' })
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' })
    }

    const u = await User.findOne({ email: email.trim().toLowerCase() })
    if (!u) return res.status(400).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, u.passwordHash)
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' })

    const tok = jwt.sign(
      { id: u._id, role: u.role, name: u.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token: tok })
  } catch (e) {
    console.log('login error', e)
    res.status(500).json({ error: 'Login failed' })
  }
})

module.exports = router