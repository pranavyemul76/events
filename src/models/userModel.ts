import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  role: string;
  state: string;
  district: string;
  DOB: string;
  phone: string;
  address: string;
}

const userSchema = new Schema<IUser>({
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

export default mongoose.model<IUser>("User", userSchema);
