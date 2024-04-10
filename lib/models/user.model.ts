import mongoose, {
  Document,
  Schema,
  Model,
  Types,
  PopulatedDoc,
} from "mongoose";
import { ThreadDocument } from "@/lib/models/thread.model";
import { CommunityDocument } from "./community.model";

export interface UserDocument {
  _id: Types.ObjectId & UserDocument;
  id: string;
  username: string;
  name: string;
  image?: string;
  bio?: string;
  threads: NonNullable<PopulatedDoc<Types.ObjectId & ThreadDocument>>[];
  onboarded: boolean;
  communities: NonNullable<PopulatedDoc<Types.ObjectId & CommunityDocument>>[];
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
