import mongoose from "mongoose";

const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { dbName: "styio", bufferCommands: false, serverSelectionTimeoutMS: 8000 })
      .catch((e) => {
        cached.promise = null;
        throw e;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
