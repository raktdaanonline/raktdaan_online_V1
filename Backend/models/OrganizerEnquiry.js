import mongoose from "mongoose";

const organizerEnquirySchema = new mongoose.Schema({
  organizerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  organizationType: { 
    type: String, 
    enum: ['personal', 'college', 'ngo', 'corporate', 'society'],
    required: true 
  },
  organizationName: { type: String },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String },
  area: { type: String, required: true },
  expectedDonors: { type: String }, // Changing to string for ranges like "10-25"
  venueAvailable: { type: Boolean, default: false },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' 
  },
  adminNote: { type: String },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model("OrganizerEnquiry", organizerEnquirySchema);
