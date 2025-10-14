import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, unique: true, trim: true, lowercase: true },
    company: { type: String, trim: true },
    position: { type: String, trim: true },
    going: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Guest", guestSchema);
