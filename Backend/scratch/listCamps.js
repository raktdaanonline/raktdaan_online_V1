import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/raktdaan";
console.log("Connecting to:", mongoURI);

await mongoose.connect(mongoURI, { dbName: process.env.DB_NAME });

const campSchema = new mongoose.Schema({}, { strict: false });
const Camp = mongoose.model('Camp', campSchema, 'camps');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

const organizerSchema = new mongoose.Schema({}, { strict: false });
const Organizer = mongoose.model('Organizer', organizerSchema, 'organizers');

console.log("--- ALL USERS ---");
const users = await User.find({});
users.forEach(u => console.log(`User: ID=${u._id}, Name=${u.name}, Email=${u.email}, Role=${u.role}`));

console.log("--- ALL ORGANIZERS ---");
const organizers = await Organizer.find({});
organizers.forEach(o => console.log(`Organizer: ID=${o._id}, Name=${o.name}, Email=${o.email}`));

console.log("--- ALL CAMPS ---");
const camps = await Camp.find({});
camps.forEach(c => console.log(`Camp: ID=${c._id}, Title=${c.title || c.name}, Organizer=${c.organizer}, Status=${c.status}`));

await mongoose.disconnect();
