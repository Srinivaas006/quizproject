const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  name: String,
  role: { type: String, default: 'admin' },
  isVerified: { type: Boolean, default: false },

  emailOtp: { type: String, default: null },
  emailOtpExpiry: { type: Date, default: null },

  resetOtp: { type: String, default: null },
  resetOtpExpiry: { type: Date, default: null }
})

module.exports = mongoose.model('User', userSchema)