const { Schema, model } = require("mongoose");

const SaleSchema = new Schema(
  {
    // add flexible fields matching dataset — use mixed types where necessary
    customerName: { type: String, index: true },
    phoneNumber: { type: String, index: true },
    customerRegion: { type: String, index: true },
    gender: String,
    age: Number,
    productCategory: String,
    tags: [String],
    paymentMethod: String,
    date: { type: Date, index: true },
    quantity: Number,
    amount: Number,
    // allow any other fields
    raw: { type: Schema.Types.Mixed },
  },
  { strict: false, timestamps: false }
);

module.exports = model("Sale", SaleSchema);
