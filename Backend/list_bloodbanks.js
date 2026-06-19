import "dotenv/config";
import mongoose from "mongoose";
import BloodBank from "./models/BloodBank.js";

const mongoURI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

mongoose.connect(mongoURI, { dbName })
  .then(async () => {
    const banks = await BloodBank.find();
    console.log(`Total blood banks: ${banks.length}`);
    banks.forEach(b => {
      console.log(`Id: ${b._id}, Name: ${b.name}, Status: ${b.status}, isVerified: ${b.isVerified}, Location: ${JSON.stringify(b.location)}`);
    });
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
