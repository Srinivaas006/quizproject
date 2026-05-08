const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const u = new User({ name, email, passwordHash: hashed, role: 'admin' })
    await u.save()

    const tok = jwt.sign({ id: u._id, role: u.role, name: u.name }, process.env.JWT_SECRET)
    res.json({ token: tok })
  } catch(e) {
    console.log('register error', e)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const u = await User.findOne({ email })
    if (!u) return res.status(400).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, u.passwordHash)
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' })
    const tok = jwt.sign({ id: u._id, role: u.role, name: u.name }, process.env.JWT_SECRET)
    res.json({ token: tok })
  } catch(e) {
    res.status(500).json({ error: 'Login failed' })
  }
})

module.exports = router