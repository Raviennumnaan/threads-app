"use server";

import { connectToDB } from "@/lib/mongoose";
import Thread, { ThreadDocument } from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";

type createThreadProps = {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
};

export const createThread = async ({
  text,
  author,
  communityId,
  path,
}: createThreadProps) => {
  try {
    await connectToDB();

    const newThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // Update user model
    await User.findByIdAndUpdate(author, { $push: { threads: newThread._id } });

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
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: Thread,
        select: "_id name parentId createdAt updatedAt",
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
