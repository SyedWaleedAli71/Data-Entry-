import mongoose from "mongoose";

type MongooseCache = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const cached = (globalThis as typeof globalThis & { mongooseCache?: MongooseCache }).mongooseCache ?? {
  connection: null,
  promise: null,
};
(globalThis as typeof globalThis & { mongooseCache?: MongooseCache }).mongooseCache = cached;

export async function connectToDatabase() {
  if (cached.connection) return cached.connection;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false }).catch((error: unknown) => {
      cached.promise = null;
      throw error;
    });
  }
  cached.connection = await cached.promise;
  return cached.connection;
}
