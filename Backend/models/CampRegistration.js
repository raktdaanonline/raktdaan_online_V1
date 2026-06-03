import mongoose from 'mongoose';

const campRegistrationSchema = new mongoose.Schema({
  registrationId: { type: String, unique: true },
  campId: { type: String, required: true },
  camp: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp' },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  age: { type: Number, required: true },
  timeSlot: { type: String, required: true },
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'attended', 'cancelled'],
    default: 'registered'
  },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const CampRegistration = mongoose.model('CampRegistration', campRegistrationSchema);
export default CampRegistration;
