import { useUserProfile } from "./useUserProfile";

export interface UserDisplayInfo {
  avatar: string | null;
  username: string;
  displayName: string;
}

/**
 * Hook to get display information for any user (avatar, username, etc.)
 * Falls back to principal ID if no profile exists
 */
export function useUserDisplay(principalId?: string): UserDisplayInfo {
  const { data: profile } = useUserProfile(principalId);

  if (!principalId) {
    return {
      avatar: null,
      username: "Unknown",
      displayName: "Unknown User",
    };
  }

  return {
    avatar: profile?.avatar_url || null,
    username: profile?.username || `${principalId.slice(0, 8)}...`,
    displayName:
      profile?.username ||
      `${principalId.slice(0, 6)}...${principalId.slice(-4)}`,
  };
}

/**
 * Hook to get multiple user display information
 */
export function useMultipleUserDisplay(principalIds: string[]) {
  const results = principalIds.map((id) => ({
    principalId: id,
    ...useUserDisplay(id),
  }));

  return results;
}
