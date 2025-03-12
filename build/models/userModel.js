import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    role: { type: String, default: "user" },
    state: { type: String, required: false },
    district: { type: String, required: false },
    DOB: { type: String, required: false },
    phone: { type: String, required: false },
    address: { type: String, required: false },
});
export default mongoose.model("User", userSchema);
