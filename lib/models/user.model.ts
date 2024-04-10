import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { ThreadDocument } from "@/lib/models/thread.model";

export interface UserDocument extends Document {
  id: string;
  username: string;
  name: string;
  image?: string;
  bio?: string;
  threads: Types.ObjectId[];
  onboarded: boolean;
  communities: Types.ObjectId[];
}

export interface PopulatedUserDocument extends Document {
  id: string;
  username: string;
  name: string;
  image?: string;
  bio?: string;
  threads: ThreadDocument[];
  onboarded: boolean;
  communities: Types.ObjectId[];
}

interface UserModel extends Model<UserDocument> {}

const userSchema = new Schema<UserDocument, UserModel>({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  threads: [{ type: Schema.Types.ObjectId, ref: "Thread" }],
  onboarded: { type: Boolean, default: false },
  communities: [{ type: Schema.Types.ObjectId, ref: "Community" }],
});

const User: UserModel =
  mongoose.models.User ||
  mongoose.model<UserDocument, UserModel>("User", userSchema);
export default User;
