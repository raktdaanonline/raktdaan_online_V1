import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
const Organizer = mongoose.model('Organizer', new mongoose.Schema({}, { strict: false }), 'organizers');

console.log("--- USER SHIVAM ---");
console.log(await User.findById("6a338769640b243ca88e4782"));

console.log("--- ORGANIZER SHIVAM ---");
console.log(await Organizer.findById("6a338e323dec94ea11845bd0"));

await mongoose.disconnect();
