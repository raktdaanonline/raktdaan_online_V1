import "dotenv/config";
import mongoose from "mongoose";
import BloodBank from "../models/BloodBank.js";

async function list() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
  console.log("Connected to DB");
  
  const banks = await BloodBank.find({});
  console.log(`Total Blood Banks: ${banks.length}`);
  banks.forEach(b => {
    console.log(`- ID: ${b._id}, Name: ${b.name}, Email: ${b.email}, Status: ${b.status}`);
  });
  
  process.exit(0);
}

list();
