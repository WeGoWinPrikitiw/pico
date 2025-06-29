import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserDisplay } from "@/hooks/useUserDisplay";

interface UserAvatarProps {
  principalId?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  showPrincipal?: boolean;
  fallbackSize?: "xs" | "sm" | "md";
  className?: string;
  currentUser?: string; // For showing "You" instead of username
}

export function UserAvatar({
  principalId,
  size = "md",
  showName = false,
  showPrincipal = false,
  fallbackSize = "sm",
  className = "",
  currentUser,
}: UserAvatarProps) {
  const { avatar, username, displayName } = useUserDisplay(principalId);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const fallbackClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
  };

  const isCurrentUser = currentUser === principalId;
  const displayText = isCurrentUser
    ? "You"
    : showPrincipal
    ? displayName
    : username;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        {avatar && <AvatarImage src={avatar} alt={username} />}
        <AvatarFallback className={fallbackClasses[fallbackSize]}>
          {principalId ? principalId.slice(0, 2).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className="font-medium text-foreground">{displayText}</span>
      )}
    </div>
  );
}

interface UserNameProps {
  principalId?: string;
  currentUser?: string;
  maxLength?: number;
  showPrincipal?: boolean;
  className?: string;
}

export function UserName({
  principalId,
  currentUser,
  maxLength,
  showPrincipal = false,
  className = "",
}: UserNameProps) {
  const { username, displayName } = useUserDisplay(principalId);

  const isCurrentUser = currentUser === principalId;
  if (isCurrentUser) return <span className={className}>You</span>;

  let text = showPrincipal ? displayName : username;
  if (maxLength && text.length > maxLength) {
    text = `${text.slice(0, maxLength)}...`;
  }

  return <span className={className}>{text}</span>;
}
