import "dotenv/config";
import mongoose from "mongoose";
import BloodBank from "../models/BloodBank.js";

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
  console.log("Connected to DB");
  
  const bank = await BloodBank.findOne({ email: "rdhayatidak@gmail.com" });
  if (!bank) {
    console.log("Blood bank not found");
  } else {
    console.log("=== Blood Bank Inspection ===");
    console.log("ID:", bank._id);
    console.log("Name:", bank.name);
    console.log("Email:", bank.email);
    console.log("Status:", bank.status);
    console.log("Password Token:", bank.passwordToken);
    console.log("Password Setup Token:", bank.passwordSetupToken);
    console.log("Password Setup Token Expires:", bank.passwordSetupTokenExpires);
    console.log("Status History:", JSON.stringify(bank.statusHistory, null, 2));
  }
  
  process.exit(0);
}

inspect();
