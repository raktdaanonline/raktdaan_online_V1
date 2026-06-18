import "dotenv/config";
import mongoose from "mongoose";
import OrganizerEnquiry from "../models/OrganizerEnquiry.js";

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
  console.log("Connected to DB");
  
  const enq = await OrganizerEnquiry.findOne({ organizerName: "Shivam Dhayatidak" });
  if (!enq) {
    console.log("Enquiry not found");
  } else {
    console.log("=== Enquiry Inspection ===");
    console.log("ID:", enq._id);
    console.log("Organizer Name:", enq.organizerName);
    console.log("Status:", enq.status);
    console.log("Assigned Blood Bank ID:", enq.assignedBloodBank);
    console.log("Blood Bank Response Status (bloodBankStatus):", enq.bloodBankStatus);
    console.log("Resources Confirmed:", enq.resourcesConfirmed);
    console.log("Notes:", enq.bloodBankNotes);
  }
  
  process.exit(0);
}

inspect();
