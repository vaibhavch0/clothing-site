import mongoose from "mongoose";

// Lifecycle: seller submits -> "pending" -> admin edits + publishes -> "available" (visible to customers)
// -> "sold". Admin may also "reject" a submission.
const ListingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    brand: { type: String, trim: true, maxlength: 60, default: "" },
    category: { type: String, required: true },
    size: { type: String, required: true },
    condition: { type: String, default: "" }, // legacy field, no longer used
    sellerPrice: { type: Number, min: 1, max: 100000 }, // what the seller asked for
    mrp: { type: Number, min: 1, max: 100000 }, // original price, shown struck-through when discounted
    discountPercent: { type: Number, min: 0, max: 90, default: 0 },
    price: { type: Number, required: true, min: 1, max: 100000 }, // final customer price = mrp minus discount, set by admin
    images: { type: [String], default: [] }, // data URLs, served via /api/listings/:id/image/:n
    imageCount: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "available", "sold", "rejected"], default: "pending", index: true },
    adminNote: { type: String, default: "" },
    publishedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
