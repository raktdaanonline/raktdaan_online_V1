import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME;

    if (!mongoURI) throw new Error("MONGO_URI is missing in .env");
    if (!dbName) throw new Error("DB_NAME is missing in .env");

    const connection = await mongoose.connect(mongoURI, { dbName });
    console.log(`MongoDB connected: ${connection.connection.host}/${dbName}`);
  } catch (error) {
    console.error("Error while connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
