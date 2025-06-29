import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, useServices } from "@/context/auth-context";
import { createQueryKey } from "@/lib/query-client";
import { toast } from "sonner";
import type { FrontendUserProfile } from "@/services/user-profile.service";

// Hook to check if username is available
export function useUsernameAvailable(username: string) {
  const { userProfileService } = useServices();

  return useQuery({
    queryKey: createQueryKey.usernameAvailable(username),
    queryFn: () =>
      userProfileService?.isUsernameAvailable(username) ??
      Promise.resolve(true),
    enabled: !!username && username.length >= 3 && !!userProfileService,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to get user profile
export function useUserProfile(principal?: string) {
  const { userProfileService } = useServices();

  return useQuery({
    queryKey: createQueryKey.userProfile(principal || ""),
    queryFn: () =>
      userProfileService?.getProfile(principal || "") ??
      Promise.reject("No principal"),
    enabled: !!principal && !!userProfileService,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry if profile doesn't exist
  });
}

// Hook to get profile by username
export function useUserProfileByUsername(username: string) {
  const { userProfileService } = useServices();

  return useQuery({
    queryKey: createQueryKey.userProfileByUsername(username),
    queryFn: () =>
      userProfileService?.getProfileByUsername(username) ??
      Promise.reject("No username"),
    enabled: !!username && !!userProfileService,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

// Hook to check if user has profile
export function useHasProfile(principal?: string) {
  const { userProfileService } = useServices();

  return useQuery({
    queryKey: createQueryKey.hasProfile(principal || ""),
    queryFn: () =>
      userProfileService?.hasProfile(principal || "") ?? Promise.resolve(false),
    enabled: !!principal && !!userProfileService,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook to list profiles with pagination
export function useListProfiles(offset: number = 0, limit: number = 20) {
  const { userProfileService } = useServices();

  return useQuery({
    queryKey: createQueryKey.listProfiles(offset, limit),
    queryFn: () =>
      userProfileService?.listProfiles(offset, limit) ?? Promise.resolve([]),
    enabled: !!userProfileService,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to search profiles
export function useSearchProfiles(searchQuery: string) {
  const { userProfileService } = useServices();

  return useQuery({
    queryKey: createQueryKey.searchProfiles(searchQuery),
    queryFn: () =>
      userProfileService?.searchProfiles(searchQuery) ?? Promise.resolve([]),
    enabled: !!searchQuery && searchQuery.length >= 2 && !!userProfileService,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Hook to get profile stats
export function useProfileStats() {
  const { userProfileService } = useServices();

  return useQuery({
    queryKey: createQueryKey.profileStats(),
    queryFn: () =>
      userProfileService?.getStats() ??
      Promise.resolve({
        total_profiles: 0,
        complete_profiles: 0,
        incomplete_profiles: 0,
      }),
    enabled: !!userProfileService,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook to create profile
export function useCreateProfile() {
  const { principal } = useAuth();
  const { userProfileService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      username: string;
      name: string;
      about: string;
      avatar_url?: string;
      social: {
        website?: string;
        twitter?: string;
        instagram?: string;
      };
    }) => {
      if (!principal || !userProfileService) {
        throw new Error("Not authenticated or service not available");
      }
      return userProfileService.createProfile(principal, input);
    },
    onSuccess: (profile: FrontendUserProfile) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: createQueryKey.userProfile(profile.principal_id),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.hasProfile(profile.principal_id),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.profileStats(),
      });

      toast.success("Profile created successfully!");
    },
    onError: (error) => {
      console.error("Create profile failed:", error);
      toast.error("Failed to create profile. Please try again.");
    },
  });
}

// Hook to update profile
export function useUpdateProfile() {
  const { principal } = useAuth();
  const { userProfileService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      username: string;
      name: string;
      about: string;
      avatar_url?: string;
      social: {
        website?: string;
        twitter?: string;
        instagram?: string;
      };
    }) => {
      if (!principal || !userProfileService) {
        throw new Error("Not authenticated or service not available");
      }
      return userProfileService.updateProfile(principal, input);
    },
    onSuccess: (profile: FrontendUserProfile) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: createQueryKey.userProfile(profile.principal_id),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.userProfileByUsername(profile.username),
      });

      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      console.error("Update profile failed:", error);
      toast.error("Failed to update profile. Please try again.");
    },
  });
}

// Hook to delete profile
export function useDeleteProfile() {
  const { principal } = useAuth();
  const { userProfileService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!principal || !userProfileService) {
        throw new Error("Not authenticated or service not available");
      }
      return userProfileService.deleteProfile(principal);
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      if (principal) {
        queryClient.invalidateQueries({
          queryKey: createQueryKey.userProfile(principal),
        });
        queryClient.invalidateQueries({
          queryKey: createQueryKey.hasProfile(principal),
        });
      }
      queryClient.invalidateQueries({
        queryKey: createQueryKey.profileStats(),
      });

      toast.success("Profile deleted successfully!");
    },
    onError: (error) => {
      console.error("Delete profile failed:", error);
      toast.error("Failed to delete profile. Please try again.");
    },
  });
}

// Profile operations helper
export function useProfileOperations() {
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();

  return {
    createProfile,
    updateProfile,
    deleteProfile,
    isLoading:
      createProfile.isPending ||
      updateProfile.isPending ||
      deleteProfile.isPending,
  };
}
