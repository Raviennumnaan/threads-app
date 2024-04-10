import UserCard from "@/components/cards/user-card";
import { fetchUser, getUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function SearchPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-up");
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // Fetch Users
  const { users, isNext } = await getUsers({
    pageNumber: 1,
    pageSize: 20,
    userId: user.id,
    searchString: "",
    sortBy: "desc",
  });

  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>
      {/* SEARCH BAR */}
      <div className="mt-14 flex flex-col gap-9">
        {users.length === 0 ? (
          <p className="no-result">No users</p>
        ) : (
          <>
            {users.map((user) => (
              <UserCard key={user.id} user={user} personType="User" />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
