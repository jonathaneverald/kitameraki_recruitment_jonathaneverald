import mongoose, { Document } from "mongoose";

export interface IUser {
  user_id: string;
  username: string;
  name: string;
  password: string;
  token?: string;
}

export interface User extends Document, IUser {}

const userSchema = new mongoose.Schema({
  user_id: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  token: { type: String, default: "" },
});

const UserModel = mongoose.model<User>("user", userSchema);

export default UserModel;
