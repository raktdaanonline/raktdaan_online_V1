import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true })

const Admin = mongoose.model('Admin', adminSchema)

export const initializeAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL
    const pw = process.env.ADMIN_PASSWORD

    if (!email || !pw) {
      console.log('ℹ️ Skipping default admin creation (ADMIN_EMAIL or ADMIN_PASSWORD not set).')
      return
    }

    const existing = await Admin.findOne({ email })
    if (!existing) {
      const hashed = await bcrypt.hash(pw, 10)
      await Admin.create({ email, password: hashed })
      console.log(`✅ Default admin created: ${email} / (password from env)`)
    } else {
      console.log('✅ Default admin already exists')
    }
  } catch (err) {
    console.error('❌ Error initializing admin:', err)
  }
}

export default Admin
