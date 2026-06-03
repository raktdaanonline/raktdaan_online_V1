import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["AWARENESS", "GUIDE", "MYTHS", "UPDATE", "EVENT", "RESEARCH"],
      default: "AWARENESS",
    },
    thumbnailUrl: { type: String, default: "" },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    author: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

// Auto-set publishedAt when published flag turns true
newsSchema.pre("save", function (next) {
  if (this.isModified("published") && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const News = mongoose.model("News", newsSchema);
export default News;
