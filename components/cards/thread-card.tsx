import { ThreadDocument } from "@/lib/models/thread.model";
import Image from "next/image";
import Link from "next/link";

type ThreadCardProps = {
  currentUserId?: string;
  thread: ThreadDocument;
  isComment: boolean;
};

export default function ThreadCard({
  thread,
  currentUserId,
  isComment = false,
}: ThreadCardProps) {
  return (
    <article
      className={`flex w-full flex-col rounded-xl bg-dark-2 p-7 ${
        isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link
              href={`/profile/${thread.author.id}`}
              className="relative h-11 w-11"
            >
              <Image
                src={thread.author.image || ""}
                alt={thread.author.name}
                fill
                className="rounded-full cursor-pointer"
              />
            </Link>
            <div className="thread-card_bar" />
          </div>

          <div className="flex w-full flex-col">
            <Link href={`/profile/${thread.author.id}`} className="w-fit ">
              <h4 className="cursor-pointer text-base-semibold text-light-1">
                {thread.author.name}
              </h4>
            </Link>
            <p className="mt-2 text-small-regular text-light-2">
              {thread.text}
            </p>
            <div
              className={`mt-5 flex flex-col gap-3 ${isComment ? "mb-10" : ""}`}
            >
              <div className="flex gap-3.5">
                <Image
                  src="/assets/heart-gray.svg"
                  alt="heart"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <Link href={`/thread/${thread._id}`}>
                  <Image
                    src="/assets/reply.svg"
                    alt="reply"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                  />
                </Link>
                <Image
                  src="/assets/repost.svg"
                  alt="repost"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <Image
                  src="/assets/share.svg"
                  alt="share"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
              </div>

              {isComment && thread.children.length > 0 && (
                <Link href={`/thread/${thread._id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">
                    {thread.children.length} replies
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
