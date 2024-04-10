import mongoose, { Schema, Model, Types, PopulatedDoc } from "mongoose";
import { UserDocument } from "@/lib/models/user.model";
import { CommunityDocument } from "@/lib/models/community.model";

export interface ThreadDocument {
  _id: Types.ObjectId;
  id: string;
  text: string;
  author: NonNullable<PopulatedDoc<Types.ObjectId & UserDocument>>;
  community?: PopulatedDoc<Types.ObjectId & CommunityDocument>;
  createdAt: Date;
  parentId?: string;
  children: NonNullable<PopulatedDoc<Types.ObjectId & ThreadDocument>>[];
}

const ThreadSchema = new Schema<ThreadDocument>(
  {
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
    parentId: { type: String },
    children: [{ type: Schema.Types.ObjectId, ref: "Thread", required: true }],
  },
  { timestamps: true }
);

export interface ThreadModel extends Model<ThreadDocument> {}

const ThreadModel: ThreadModel =
  mongoose.models.Thread ||
  mongoose.model<ThreadDocument, ThreadModel>("Thread", ThreadSchema);

export default ThreadModel;
