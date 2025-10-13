import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIncomingStock,
  addIncomingStock,
  updateIncomingStock,
  deleteIncomingStock,
  getIncomingStockByStatus,
} from "../services/incomingStockService";
import type { IncomingStock } from "../types/inventory";

// Query keys
export const incomingStockKeys = {
  all: ["incomingStock"] as const,
  lists: () => [...incomingStockKeys.all, "list"] as const,
  list: (filters: string) => [...incomingStockKeys.lists(), { filters }] as const,
  details: () => [...incomingStockKeys.all, "detail"] as const,
  detail: (id: string) => [...incomingStockKeys.details(), id] as const,
  byStatus: (status: string) => [...incomingStockKeys.all, "status", status] as const,
};

// Hooks for fetching data
export const useIncomingStock = () => {
  return useQuery({
    queryKey: incomingStockKeys.lists(),
    queryFn: getIncomingStock,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useIncomingStockByStatus = (status: "incoming" | "in-use") => {
  return useQuery({
    queryKey: incomingStockKeys.byStatus(status),
    queryFn: () => getIncomingStockByStatus(status),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Mutation hooks
export const useAddIncomingStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addIncomingStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomingStockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incomingStockKeys.byStatus("incoming") });
    },
  });
};

export const useUpdateIncomingStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: Partial<IncomingStock> }) =>
      updateIncomingStock(id, stock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomingStockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incomingStockKeys.byStatus("incoming") });
      queryClient.invalidateQueries({ queryKey: incomingStockKeys.byStatus("in-use") });
    },
  });
};

export const useDeleteIncomingStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteIncomingStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomingStockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incomingStockKeys.byStatus("incoming") });
    },
  });
};
