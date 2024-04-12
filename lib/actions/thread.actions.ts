"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "@/lib/mongoose";
import Thread, { ThreadDocument } from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import Community, { CommunityDocument } from "@/lib/models/community.model";
import { threadId } from "worker_threads";

type createThreadProps = {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
};

export const createThread = async ({
  text,
  author,
  communityId = null,
  path,
}: createThreadProps) => {
  try {
    await connectToDB();
    let community: (Pick<CommunityDocument, "_id"> & Document) | null = null;
    if (communityId)
      community = await Community.findOne({ id: communityId }, { _id: 1 });

    const newThread = await Thread.create({
      text,
      author,
      community: community?._id,
    });

    // Update user model
    await User.findByIdAndUpdate(author, { $push: { threads: newThread._id } });

    if (community)
      await Community.findByIdAndUpdate(community._id, {
        $push: { threads: newThread._id },
      });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
};

export const fetchThreads = async (
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<{ threads: ThreadDocument[]; isNext: boolean }> => {
  await connectToDB();

  const skipAmount = (pageNumber - 1) * pageSize;

  const threads = await Thread.find({
    parentId: { $in: [null, undefined] },
  })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({ path: "community", model: Community })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: Thread,
        select: "_id name image",
      },
    });

  const totalThreadsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const isNext = totalThreadsCount > skipAmount + threads.length;

  return { threads, isNext };
};

export const getThreadById = async (
  id: string
): Promise<ThreadDocument | null> => {
  try {
    await connectToDB();
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "_id id name image",
        },
      });
    return thread;
  } catch (error: any) {
    throw new Error(`Error in getting thread ${error.message}`);
  }
};

export const addCommentToThread = async (
  threadId: string,
  text: string,
  userId: string,
  path: string
) => {
  try {
    await connectToDB();
    const parentThread = await Thread.findById(threadId);
    if (!parentThread) throw new Error("Thread not found");

    const comment = await Thread.create({
      text,
      author: userId,
      parentId: parentThread.id,
    });

    parentThread.children.push(comment.id);
    await parentThread.save();
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding a comment ${error.message}`);
  }
};

const fetchAllChildThreads = async (
  threadId: string
): Promise<ThreadDocument[]> => {
  const childThreads = await Thread.find({ parentId: threadId });

  const result: ThreadDocument[] = [];
  childThreads.forEach(async (child) => {
    const descendants = await fetchAllChildThreads(child._id.toString());
    result.push(child, ...descendants);
  });

  return result;
};

export const deleteThread = async (id: string, path: string) => {
  try {
    await connectToDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const communityIds = [
      ...descendantThreads.map((thread) => thread.community?._id?.toString()),
      mainThread.community?._id?.toString(),
    ].filter((s): s is string => Boolean(s));

    const uniqueCommunityIds = new Set(communityIds);

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
};
