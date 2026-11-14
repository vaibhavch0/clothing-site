import mongoose from "mongoose";

// One document per (key, time window). MongoDB deletes them automatically after expiresAt.
const RateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

export default mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);
