const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const u = new User({ email, passwordHash: hashed, role: 'admin' })
    await u.save()
    const tok = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET)
    res.json({ token: tok })
  } catch(e) {
    res.status(500).json({ error: 'something went wrong' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const u = await User.findOne({ email })
  if (!u) return res.status(400).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, u.passwordHash)
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' })
  const tok = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET)
  res.json({ token: tok })
})

module.exports = router