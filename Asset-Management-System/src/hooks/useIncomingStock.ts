import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIncomingStock,
  addIncomingStock,
  updateIncomingStock,
  deleteIncomingStock,
  getIncomingStockByStatus,
} from "../services/incomingStockService";
import { receivableKeys } from "./useReceivables";
import { assetKeys } from "./useAssets";
import type { IncomingStock } from "../types/inventory";

// Query keys
export const incomingStockKeys = {
  all: ["incomingStock"] as const,
  lists: () => [...incomingStockKeys.all, "list"] as const,
  list: (filters: string) =>
    [...incomingStockKeys.lists(), { filters }] as const,
  details: () => [...incomingStockKeys.all, "detail"] as const,
  detail: (id: string) => [...incomingStockKeys.details(), id] as const,
  byStatus: (status: string) =>
    [...incomingStockKeys.all, "status", status] as const,
};

// Hooks for fetching data
export const useIncomingStock = () => {
  return useQuery({
    queryKey: incomingStockKeys.lists(),
    queryFn: getIncomingStock,
    staleTime: 30 * 1000, // 30 seconds instead of 2 minutes
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
};

export const useIncomingStockByStatus = (status: "incoming" | "in-use") => {
  return useQuery({
    queryKey: incomingStockKeys.byStatus(status),
    queryFn: () => getIncomingStockByStatus(status),
    staleTime: 30 * 1000, // 30 seconds instead of 2 minutes
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
};

// Mutation hooks
export const useAddIncomingStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addIncomingStock,
    onSuccess: () => {
      // Invalidate all incoming stock related queries
      queryClient.invalidateQueries({ queryKey: incomingStockKeys.all });

      // Invalidate receivables queries since new incoming stock affects receivables
      queryClient.invalidateQueries({ queryKey: receivableKeys.all });
    },
  });
};

export const useUpdateIncomingStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      stock,
    }: {
      id: string;
      stock: Partial<IncomingStock>;
    }) => updateIncomingStock(id, stock),
    onSuccess: () => {
      // Invalidate all incoming stock related queries
      queryClient.invalidateQueries({ queryKey: incomingStockKeys.all });

      // Invalidate receivables queries since status changes affect receivables
      queryClient.invalidateQueries({ queryKey: receivableKeys.all });

      // Invalidate assets queries since allocation creates new assets
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
};

export const useDeleteIncomingStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIncomingStock,
    onSuccess: () => {
      // Invalidate all incoming stock related queries
      queryClient.invalidateQueries({ queryKey: incomingStockKeys.all });

      // Invalidate receivables queries since receivables depend on incoming stock
      queryClient.invalidateQueries({ queryKey: receivableKeys.all });
    },
  });
};
