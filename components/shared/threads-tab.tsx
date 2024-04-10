import { getUserThreads } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/thread-card";

type ThreadsTabProps = {
  currentUserId: string;
  accountId: string;
  accountType: "User" | "Admin";
};

export default async function ThreadsTab({
  accountId,
  accountType,
  currentUserId,
}: ThreadsTabProps) {
  const userThreads = await getUserThreads(accountId);
  if (!userThreads) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {userThreads.threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          isComment={false}
          currentUserId={currentUserId}
        />
      ))}
    </section>
  );
}
