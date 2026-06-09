require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

async function main() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected.')

  const count = await User.countDocuments({ role: 'admin' })
  console.log(`Found ${count} teacher account(s).`)

  if (count === 0) {
    console.log('Nothing to delete. Exiting.')
    process.exit(0)
  }

  const result = await User.deleteMany({ role: 'admin' })
  console.log(`✅ Deleted ${result.deletedCount} teacher account(s).`)
  process.exit(0)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})