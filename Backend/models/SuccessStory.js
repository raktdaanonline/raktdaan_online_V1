import mongoose from "mongoose";

const successStorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    initials: { type: String },
    subtitle: { type: String },
    review: { type: String, required: true },
    image: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SuccessStory = mongoose.model("SuccessStory", successStorySchema);
export default SuccessStory;
