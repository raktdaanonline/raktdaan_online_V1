import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true }, // Not required for donors using mobile only
  mobile: { type: String, required: true, unique: true },
  password: { type: String }, // For organizers
  bloodGroup: { type: String, required: true },
  city: { type: String },
  role: { 
    type: String, 
    enum: ['donor', 'recipient', 'organizer', 'admin'],
    default: 'donor' 
  },
  organizationType: { type: String },
  organizationName: { type: String },
  mustChangePassword: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  totalDonations: { type: Number, default: 0 },
  badge: { type: String, default: "new donor" },
  donationHistory: { type: Array, default: [] },
  nextEligibleDate: { type: Date }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
