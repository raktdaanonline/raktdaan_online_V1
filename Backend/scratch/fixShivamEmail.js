import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

const res = await User.updateOne(
  { _id: "6a338769640b243ca88e4782" },
  { $set: { email: "useuseoffice247@gmail.com" } }
);

console.log("Update result:", res);

await mongoose.disconnect();
