import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser, getUserActivity } from "@/lib/actions/user.actions";
import Link from "next/link";
import Image from "next/image";

export default async function ActivityPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-up");
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // Get activity
  const activity = await getUserActivity(userInfo._id);

  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>
      <section className="mt-10 flex flex-col gap-5">
        {activity.length > 0 ? (
          <>
            {activity.map((thread) => (
              <Link href={`/thread/${thread.parentId}`} key={thread._id}>
                <article className="activity-card">
                  <Image
                    src={thread.author.image || ""}
                    alt="Profile Image"
                    width={30}
                    height={30}
                    className="rounded-full object-cover"
                  />
                  <p className="text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500 font-semibold ">
                      {thread.author.name}
                    </span>{" "}
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3 ">No Activity yet</p>
        )}
      </section>
    </section>
  );
}
