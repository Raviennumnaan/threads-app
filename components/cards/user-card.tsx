"use client";

import { UserDocument } from "@/lib/models/user.model";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type UserCardProps = { user: UserDocument; personType: "User" };

export default function UserCard({ user, personType }: UserCardProps) {
  const router = useRouter();

  return (
    <article className="user-card">
      <div className="user-card_avatar">
        <Image
          src={user.image || ""}
          alt="Logo"
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="flex-1 text-ellipsis">
          <h4 className="text-base-semibold text-light-1">{user.name}</h4>
          <p className="text-small-medium text-gray-1 italic">
            @{user.username}
          </p>
        </div>
      </div>
      <Button
        className="user-card_btn"
        onClick={() => router.push(`profile/${user.id}`)}
      >
        View
      </Button>
    </article>
  );
}
