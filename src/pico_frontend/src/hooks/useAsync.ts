import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export type UseAsyncState<T, E = Error> = UseMutationResult<T, E, any[], unknown>;

export function useAsync<T, E = Error>(
  asyncFunction: (...args: any[]) => Promise<T>,
): UseAsyncState<T, E> {
  const mutation = useMutation<T, E, any[]>({
    mutationFn: async (args: any[]) => {
      return asyncFunction(...args);
    },
  });

  return mutation;
}
