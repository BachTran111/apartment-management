import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const URI = "mongodb://localhost:27017/";

export default async function instanceMongoDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  try {
    mongoose.set("debug", false);
    // mongoose.set("debug", { color: true });
    mongoose.set?.("strictQuery", false);

    await mongoose.connect(process.env.MONGO_URI);
    console.log(" Connected to MongoDB");
    return mongoose;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
