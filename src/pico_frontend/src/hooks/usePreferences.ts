import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQueryKey, invalidateQueries } from "@/lib/query-client";
import { serviceFactory } from "@/services";
import type { UserPreferences, PreferencesInput } from "@/types";
import { toast } from "sonner";

// Query hooks
export function usePreferences(principalId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: createQueryKey.userPreferences(principalId),
    queryFn: async () => {
      const service = serviceFactory.getPreferencesService();
      return service.getPreferences(principalId);
    },
    enabled: enabled && !!principalId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useAllPreferences() {
  return useQuery({
    queryKey: createQueryKey.preferences(),
    queryFn: async () => {
      const service = serviceFactory.getPreferencesService();
      return service.getAllPreferences();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function usePreferencesStats() {
  return useQuery({
    queryKey: createQueryKey.preferencesStats(),
    queryFn: async () => {
      const service = serviceFactory.getPreferencesService();
      const stats = await service.getStats();
      return service.convertStatsToFrontend(stats);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUsersByPreference(
  preference: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [...createQueryKey.preferences(), "by-preference", preference],
    queryFn: async () => {
      const service = serviceFactory.getPreferencesService();
      return service.getUsersByPreference(preference);
    },
    enabled: enabled && !!preference,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useSearchPreferences(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...createQueryKey.preferences(), "search", query],
    queryFn: async () => {
      const service = serviceFactory.getPreferencesService();
      return service.searchPreferences(query);
    },
    enabled: enabled && !!query && query.length > 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useHasPreferences(
  principalId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [...createQueryKey.preferences(), "has-preferences", principalId],
    queryFn: async () => {
      const service = serviceFactory.getPreferencesService();
      return service.hasPreferences(principalId);
    },
    enabled: enabled && !!principalId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePreferencesHealthCheck() {
  return useQuery({
    queryKey: [...createQueryKey.preferences(), "health"],
    queryFn: async () => {
      const service = serviceFactory.getPreferencesService();
      return service.healthCheck();
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

// Mutation hooks
export function useCreateOrUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PreferencesInput) => {
      const service = serviceFactory.getPreferencesService();
      return service.createOrUpdatePreferences(input);
    },
    onSuccess: (data, variables) => {
      toast.success("Preferences saved successfully!");

      // Invalidate and refetch related queries
      invalidateQueries.all();

      // Optimistically update the cache
      queryClient.setQueryData(
        createQueryKey.userPreferences(variables.principal_id),
        data
      );
    },
    onError: (error) => {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save preferences");
    },
  });
}

export function useCreatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PreferencesInput) => {
      const service = serviceFactory.getPreferencesService();
      return service.createPreferences(input);
    },
    onSuccess: (data, variables) => {
      toast.success("Preferences created successfully!");

      // Invalidate and refetch related queries
      invalidateQueries.all();

      // Optimistically update the cache
      queryClient.setQueryData(
        createQueryKey.userPreferences(variables.principal_id),
        data
      );
    },
    onError: (error) => {
      console.error("Failed to create preferences:", error);
      toast.error("Failed to create preferences");
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PreferencesInput) => {
      const service = serviceFactory.getPreferencesService();
      return service.updatePreferences(input);
    },
    onSuccess: (data, variables) => {
      toast.success("Preferences updated successfully!");

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: createQueryKey.userPreferences(variables.principal_id),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.preferences(),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.preferencesStats(),
      });

      // Optimistically update the cache
      queryClient.setQueryData(
        createQueryKey.userPreferences(variables.principal_id),
        data
      );
    },
    onError: (error) => {
      console.error("Failed to update preferences:", error);
      toast.error("Failed to update preferences");
    },
  });
}

export function useDeletePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalId: string) => {
      const service = serviceFactory.getPreferencesService();
      return service.deletePreferences(principalId);
    },
    onSuccess: (_, principalId) => {
      toast.success("Preferences deleted successfully!");

      // Remove from cache and invalidate related queries
      queryClient.removeQueries({
        queryKey: createQueryKey.userPreferences(principalId),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.preferences(),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.preferencesStats(),
      });
    },
    onError: (error) => {
      console.error("Failed to delete preferences:", error);
      toast.error("Failed to delete preferences");
    },
  });
}

export function useAddPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      principalId,
      preference,
    }: {
      principalId: string;
      preference: string;
    }) => {
      const service = serviceFactory.getPreferencesService();
      return service.addPreference(principalId, preference);
    },
    onSuccess: (data, { principalId }) => {
      toast.success("Preference added successfully!");

      // Update cache and invalidate related queries
      queryClient.setQueryData(
        createQueryKey.userPreferences(principalId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: createQueryKey.preferences(),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.preferencesStats(),
      });
    },
    onError: (error) => {
      console.error("Failed to add preference:", error);
      toast.error("Failed to add preference");
    },
  });
}

export function useRemovePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      principalId,
      preference,
    }: {
      principalId: string;
      preference: string;
    }) => {
      const service = serviceFactory.getPreferencesService();
      return service.removePreference(principalId, preference);
    },
    onSuccess: (data, { principalId }) => {
      toast.success("Preference removed successfully!");

      // Update cache and invalidate related queries
      queryClient.setQueryData(
        createQueryKey.userPreferences(principalId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: createQueryKey.preferences(),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey.preferencesStats(),
      });
    },
    onError: (error) => {
      console.error("Failed to remove preference:", error);
      toast.error("Failed to remove preference");
    },
  });
}

// Utility hooks
export function usePreferencesOperations() {
  const createMutation = useCreatePreferences();
  const updateMutation = useUpdatePreferences();
  const deleteMutation = useDeletePreferences();
  const addMutation = useAddPreference();
  const removeMutation = useRemovePreference();

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    addMutation.isPending ||
    removeMutation.isPending;

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    addPreference: addMutation.mutate,
    removePreference: removeMutation.mutate,
    isLoading,
    errors: {
      create: createMutation.error,
      update: updateMutation.error,
      delete: deleteMutation.error,
      add: addMutation.error,
      remove: removeMutation.error,
    },
  };
}

// Optimistic update helper for real-time feel
export function useOptimisticPreferences(principalId: string) {
  const queryClient = useQueryClient();
  const queryKey = createQueryKey.userPreferences(principalId);

  const optimisticallyAddPreference = (preference: string) => {
    queryClient.setQueryData<UserPreferences>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        preferences: [...old.preferences, preference],
        updated_at: BigInt(Date.now()),
      };
    });
  };

  const optimisticallyRemovePreference = (preference: string) => {
    queryClient.setQueryData<UserPreferences>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        preferences: old.preferences.filter((p) => p !== preference),
        updated_at: BigInt(Date.now()),
      };
    });
  };

  const rollbackOptimisticUpdate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    optimisticallyAddPreference,
    optimisticallyRemovePreference,
    rollbackOptimisticUpdate,
  };
}
