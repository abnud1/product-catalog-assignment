import mongoose from "mongoose";
export async function dbConnect() {
  const MONGODB_URI = process.env["MONGODB_URI"];
  if (!MONGODB_URI) {
    throw new Error("database not configured");
  }
  await mongoose.connect(MONGODB_URI);
}
export function dbDisconnect() {
  return mongoose.disconnect();
}
