import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReceivables,
  addReceivable,
  addReceivables,
  updateReceivable,
  deleteReceivable,
} from "../services/receivableService";
import type { Receivable } from "../types/inventory";

// Query keys
export const receivableKeys = {
  all: ["receivables"] as const,
  lists: () => [...receivableKeys.all, "list"] as const,
  list: (filters: string) => [...receivableKeys.lists(), { filters }] as const,
  details: () => [...receivableKeys.all, "detail"] as const,
  detail: (id: string) => [...receivableKeys.details(), id] as const,
};

// Hooks for fetching data
export const useReceivables = () => {
  return useQuery({
    queryKey: receivableKeys.lists(),
    queryFn: getReceivables,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Mutation hooks for data modification
export const useAddReceivable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      receivable,
      user,
    }: {
      receivable: Omit<Receivable, "id">;
      user: string;
    }) => addReceivable(receivable, user),
    onSuccess: () => {
      // Invalidate and refetch receivables
      queryClient.invalidateQueries({ queryKey: receivableKeys.lists() });
    },
  });
};

export const useAddReceivables = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      receivables,
      user,
    }: {
      receivables: Omit<Receivable, "id">[];
      user: string;
    }) => addReceivables(receivables, user),
    onSuccess: () => {
      // Invalidate and refetch receivables
      queryClient.invalidateQueries({ queryKey: receivableKeys.lists() });
    },
  });
};

export const useUpdateReceivable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      receivable,
      user,
    }: {
      id: string;
      receivable: Partial<Receivable>;
      user: string;
    }) => updateReceivable(id, receivable, user),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch receivables
      queryClient.invalidateQueries({ queryKey: receivableKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receivableKeys.detail(id) });
    },
  });
};

export const useDeleteReceivable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: string }) =>
      deleteReceivable(id, user),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch receivables
      queryClient.invalidateQueries({ queryKey: receivableKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receivableKeys.detail(id) });
    },
  });
};
