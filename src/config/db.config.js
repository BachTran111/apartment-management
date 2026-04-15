import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export default async function instanceMongoDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  try {
    mongoose.set("debug", false);
    mongoose.set?.("strictQuery", false);

    await mongoose.connect(process.env.MONGO_URI);
    console.log(" ✅ Connected to MongoDB");
    return mongoose;
  } catch (err) {
    console.warn("⚠️  MongoDB connection failed:", err.message);
    console.log("Server running in offline mode...");
    return mongoose;
  }
}
