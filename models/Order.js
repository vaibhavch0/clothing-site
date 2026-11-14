import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        title: String,
        price: Number,
        status: { type: String, enum: ["paid", "shipped", "delivered"], default: "paid" },
      },
    ],
    subtotal: Number,
    shippingFee: Number,
    total: Number,
    shipping: { name: String, phone: String, address: String, city: String, state: String, zip: String, country: String },
    paymentRef: String, // fake test-mode reference; no card data is stored
    testMode: { type: Boolean, default: true }, // true = no real payment was taken; do not ship
    status: { type: String, default: "paid" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
