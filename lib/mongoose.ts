import mongoose from "mongoose";

let isConnectted = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) return console.log("MONGO_URL is not found");

  if (isConnectted) return console.log("Already connected to MongoDB");

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnectted = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};
