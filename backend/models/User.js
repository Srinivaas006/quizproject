const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  name: String,
  rollNo: String,
  dept: String,
  year: String,
  role: { type: String, default: 'admin' }
})

module.exports = mongoose.model('User', userSchema)