import { UserDocument } from "@/lib/models/user.model";
import Image from "next/image";

type ProfileHeaderProps = { profile: UserDocument; authUserId: string };

export default function ProfileHeader({
  profile,
  authUserId,
}: ProfileHeaderProps) {
  return (
    <div className="flex w-full flex-col justify-start">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 object-cover">
            <Image
              src={profile.image || ""}
              fill
              alt="Profile Image"
              className="rounded-full object-cover shadow-2xl"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-left text-heading3-bold text-light-1">
              {profile.name}
            </h2>
            <p className="text-base-medium text-gray-1 italic">
              @{profile.username}
            </p>
          </div>
        </div>
      </div>

      {/* TODO community */}
      <p className=" mt-6 text-base-regular max-w-lg text-light-2">
        {profile.bio}
      </p>
      <div className="mt-12 h-0.5 w-full bg-dark-3" />
    </div>
  );
}
