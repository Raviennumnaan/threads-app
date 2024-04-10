import ThreadCard from "@/components/cards/thread-card";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";

export default async function HomePage() {
  const { threads, isNext } = await fetchThreads();
  const user = await currentUser();

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {threads.length === 0 ? (
          <p className="no-result">No Threads found</p>
        ) : (
          <>
            {threads.map((thread) => (
              <ThreadCard
                key={thread._id}
                currentUserId={user?.id}
                thread={thread}
                isComment={false}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}
