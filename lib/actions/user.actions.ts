"use server";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { FilterQuery, SortOrder } from "mongoose";

import { connectToDB } from "@/lib/mongoose";
import User, { UserDocument } from "@/lib/models/user.model";
import Thread, { ThreadDocument } from "@/lib/models/thread.model";
import Community from "@/lib/models/community.model";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type UpdateUserParams = {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
};

type getUserType = {
  pageNumber?: number;
  pageSize?: number;
  searchString: string;
  userId: string;
  sortBy?: SortOrder;
};

export const updateUser = async ({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: UpdateUserParams) => {
  try {
    await connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true }
    );

    if (path === "/profile/edit") revalidatePath(path);
  } catch (error) {
    console.log(error instanceof Error && error.message);
    throw new Error("Failed to create/update user");
  }
};

export const uploadImage = async (content: string) => {
  const uploadResponse = await cloudinary.uploader.upload(content);
  return uploadResponse;
};

export const fetchUser = async (
  userId: string
): Promise<UserDocument | null> => {
  try {
    connectToDB();

    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
  } catch (error) {
    console.log(error instanceof Error && error.message);
    throw new Error("Failed to fetch user");
  }
};

export const getUserThreads = async (
  userId: string
): Promise<UserDocument | null> => {
  try {
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "_id id name image",
          },
        },
        {
          path: "author",
          model: User,
          select: "_id id name image",
        },
        {
          path: "community",
          model: Community,
          select: "name id image _id",
        },
      ],
    });

    return threads;
  } catch (error) {
    console.log(error instanceof Error && error.message);
    throw new Error("Failed to get user threads");
  }
};

export const getUsers = async ({
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
  userId,
  searchString,
}: getUserType): Promise<{ users: UserDocument[]; isNext: boolean }> => {
  try {
    await connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<UserDocument> = { id: { $ne: userId } };
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const usersCount = await User.countDocuments(query);
    const isNext = usersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.log(error instanceof Error && error.message);
    throw new Error("Failed to get user");
  }
};

export const getUserActivity = async (
  userId: string
): Promise<ThreadDocument[]> => {
  try {
    await connectToDB();
    const userThreads = await Thread.find({ author: userId });
    const childThreadIds = userThreads.reduce((acc: string[], userThread) => {
      const temp = userThread.children.map((child) => child.toString());
      return [...acc, ...temp];
    }, []);
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: "name image _id id",
    });

    return replies;
  } catch (error) {
    console.log(error instanceof Error && error.message);
    throw new Error("Failed to get Activity");
  }
};
