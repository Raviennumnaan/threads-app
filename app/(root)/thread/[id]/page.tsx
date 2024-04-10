import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import ThreadCard from "@/components/cards/thread-card";
import Comment from "@/components/forms/comment";

import { getThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";

type ThreadDetailPageProps = {
  params: { id: string };
};

export default async function ThreadDetailPage({
  params,
}: ThreadDetailPageProps) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarded");
  const thread = await getThreadById(params.id);
  if (!thread) return null;

  return (
    <section className="relative">
      <div>
        <ThreadCard
          isComment={false}
          thread={thread}
          currentUserId={userInfo._id.toString()}
        />
      </div>
      <div className="mt-7 ">
        <Comment
          threadId={thread.id}
          currentUserImage={userInfo.image || user.imageUrl}
          currentUserId={userInfo._id.toString()}
        />
      </div>

      <div className="mt-10">
        {thread.children.map((comment) => (
          <ThreadCard
            isComment
            currentUserId={userInfo._id.toString() || ""}
            key={comment._id.toString()}
            thread={comment}
          />
        ))}
      </div>
    </section>
  );
}
