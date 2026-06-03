import "dotenv/config";
import mongoose from "mongoose";
import OrganizerEnquiry from "./models/OrganizerEnquiry.js";
import User from "./models/User.js";
import Camp from "./models/Camp.js";
import transporter from "./config/emailConfig.js";

async function testApprove() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  
  const enquiries = await OrganizerEnquiry.find({ status: "pending" }).limit(1);
  if (enquiries.length === 0) {
    console.log("No pending enquiries");
    process.exit(0);
  }
  
  const enquiry = enquiries[0];
  console.log("Processing enquiry:", enquiry._id);
  
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
    } else {
      organizer.role = "organizer";
      organizer.password = "hashedPassword";
      organizer.mustChangePassword = true;
      if (!organizer.email) organizer.email = enquiry.email;
      await organizer.save();
      console.log("Updated organizer");
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
    console.log("Created camp");

    enquiry.status = "approved";
    await enquiry.save();
    console.log("Approved enquiry");

  } catch (err) {
    console.error("ERROR OCCURRED:", err);
  }
  process.exit(0);
}

testApprove();
