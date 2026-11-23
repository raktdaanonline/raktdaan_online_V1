import mongoose from "mongoose";

const invitedHospitalSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Hospital email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    invitationTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    rawToken: {
      type: String,
      default: null,
    },
    invitationExpiresAt: {
      type: Date,
      required: true,
    },
    invitationStatus: {
      type: String,
      enum: ["INVITED", "REGISTERED", "EXPIRED", "CANCELLED"],
      default: "INVITED",
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    registeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Method to verify if invitation is expired
invitedHospitalSchema.methods.isExpired = function () {
  return new Date() > new Date(this.invitationExpiresAt);
};

const InvitedHospital = mongoose.model("InvitedHospital", invitedHospitalSchema);
export default InvitedHospital;
