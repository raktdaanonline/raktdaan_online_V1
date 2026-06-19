import "dotenv/config";
import mongoose from "mongoose";
import BloodBank from "./models/BloodBank.js";

const mongoURI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

mongoose.connect(mongoURI, { dbName })
  .then(async () => {
    const result = await BloodBank.updateMany(
      { status: { $in: ["approved", "active"] } },
      { $set: { isVerified: true } }
    );
    console.log(`Updated ${result.modifiedCount} blood banks to isVerified: true`);
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
