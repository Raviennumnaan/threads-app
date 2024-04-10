import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { UserDocument } from "@/lib/models/user.model";

export interface ThreadDocument extends Document {
  text: string;
  author: Types.ObjectId;
  community?: Types.ObjectId;
  createdAt: Date;
  parentId?: string;
  children: Types.ObjectId[];
}

export interface ThreadDocumentPopulated extends Document {
  text: string;
  author: UserDocument;
  community?: Types.ObjectId;
  createdAt: Date;
  parentId?: string;
  children: ThreadDocument[];
}

interface threadModel extends Model<ThreadDocument> {}

const threadSchema = new Schema<ThreadDocument, threadModel>(
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

const Thread: threadModel =
  mongoose.models.Thread ||
  mongoose.model<ThreadDocument, threadModel>("Thread", threadSchema);
export default Thread;
