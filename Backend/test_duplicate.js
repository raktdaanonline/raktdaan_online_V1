import "dotenv/config";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME;
    await mongoose.connect(mongoURI, { dbName });
    console.log("Connected");

    const db = mongoose.connection.db;
    
    // Check users
    // Find enquiry
    const enquiry = await db.collection("organizerenquiries").findOne({ status: "pending" });
    console.log("Enquiry found:", enquiry);

    if (enquiry) {
      const { ObjectId } = mongoose.Types;
      const organizer = await db.collection("users").findOne({
        $or: [{ email: enquiry.email }, { mobile: enquiry.phone }]
      });
      console.log("Organizer found:", organizer);
      
      const User = mongoose.model("User", new mongoose.Schema({ email: { type: String, unique: true }, mobile: { type: String, unique: true } }));
      
      try {
        const u = await User.findById(organizer._id);
        u.role = "organizer";
        await u.save();
        console.log("User save success");
      } catch (err) {
        console.log("User save error:", err.message);
      }

      const Camp = mongoose.model("Camp", new mongoose.Schema({ campId: { type: String, unique: true } }));
      try {
        const camp = new Camp({ campId: "RDC" + Math.floor(Math.random() * 9000000) });
        await camp.save();
        console.log("Camp save success");
      } catch (err) {
        console.log("Camp save error:", err.message);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

connectDB();
