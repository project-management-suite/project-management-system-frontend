import { User as UserIcon } from "lucide-react";
import { UserPopover } from "./UserPopover";

interface UserAvatarProps {
  userId: string;
  username: string;
  profilePhotoUrl?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  showPopover?: boolean;
}

export const UserAvatar = ({
  userId,
  username,
  profilePhotoUrl,
  size = "md",
  showName = false,
  showPopover = true,
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const avatarContent = (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0`}
      >
        {profilePhotoUrl ? (
          <img
            src={profilePhotoUrl}
            alt={username}
            className="w-full h-full object-cover"
          />
        ) : (
          <UserIcon className={`${iconSizes[size]} text-white`} />
        )}
      </div>
      {showName && (
        <span className="text-sm font-medium hover:text-[var(--brand)] transition-colors">
          {username}
        </span>
      )}
    </div>
  );

  if (showPopover) {
    return (
      <UserPopover userId={userId} username={username}>
        {avatarContent}
      </UserPopover>
    );
  }

  return avatarContent;
};
