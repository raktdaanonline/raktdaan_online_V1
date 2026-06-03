import "dotenv/config";
import mongoose from "mongoose";
import OrganizerEnquiry from "./models/OrganizerEnquiry.js";
import User from "./models/User.js";
import Camp from "./models/Camp.js";

async function testFullApprove() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  
  // Create dummy enquiry
  const enquiry = new OrganizerEnquiry({
    organizerName: "Test Organizer",
    phone: "9999999999",
    email: "test@example.com",
    organizationType: "personal",
    organizationName: "",
    preferredDate: new Date(),
    preferredTime: "10:00 AM",
    area: "Pune",
    expectedDonors: "50-100",
    venueAvailable: true,
    message: ""
  });
  await enquiry.save();
  console.log("Created dummy pending enquiry:", enquiry._id);

  try {
    const tempPassword = "TEMP123";
    let organizer = await User.findOne({ $or: [{ email: enquiry.email }, { mobile: enquiry.phone }] });
    if (!organizer) {
      organizer = new User({
        name: enquiry.organizerName,
        email: enquiry.email,
        mobile: enquiry.phone,
        password: "hashedPassword",
        bloodGroup: "Unknown", 
        role: "organizer",
        organizationType: enquiry.organizationType,
        organizationName: enquiry.organizationName,
        mustChangePassword: true
      });
      await organizer.save();
      console.log("Created organizer");
    }

    const newCamp = new Camp({
      campId: "TESTCAMP1",
      organizer: organizer._id,
      enquiry: enquiry._id,
      title: `${enquiry.organizationName || enquiry.organizerName} Blood Drive`,
      date: enquiry.preferredDate,
      venue: enquiry.area,
      area: enquiry.area,
      expectedDonors: enquiry.expectedDonors,
      status: "upcoming"
    });
    await newCamp.save();
    console.log("Created camp successfully!");

    enquiry.status = "approved";
    await enquiry.save();
    console.log("Approved enquiry successfully!");

  } catch (err) {
    console.error("ERROR OCCURRED:", err);
  } finally {
    // cleanup
    await OrganizerEnquiry.deleteOne({ _id: enquiry._id });
    await Camp.deleteOne({ campId: "TESTCAMP1" });
    await User.deleteOne({ email: "test@example.com" });
    process.exit(0);
  }
}

testFullApprove();
