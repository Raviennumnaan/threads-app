import mongoose, {
  Document,
  Schema,
  Model,
  Types,
  PopulatedDoc,
} from "mongoose";
import { ThreadDocument } from "@/lib/models/thread.model";
import { UserDocument } from "@/lib/models/user.model";

export interface CommunityDocument {
  _id: Types.ObjectId & CommunityDocument;
  id: string;
  username: string;
  name: string;
  image?: string;
  bio?: string;
  createdBy: NonNullable<PopulatedDoc<Types.ObjectId & UserDocument>>;
  threads: NonNullable<PopulatedDoc<Types.ObjectId & ThreadDocument>>[];
  members: NonNullable<PopulatedDoc<Types.ObjectId & UserDocument>>[];
}

interface CommunityModel extends Model<CommunityDocument> {}

const communitySchema = new Schema<CommunityDocument, CommunityModel>({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  threads: [{ type: Schema.Types.ObjectId, ref: "Thread" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Community: CommunityModel =
  mongoose.models.Community ||
  mongoose.model<CommunityDocument, CommunityModel>(
    "Community",
    communitySchema
  );
export default Community;
