import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConsumables,
  addConsumable,
  updateConsumable,
  deleteConsumable,
  getConsumableTransactions,
  addConsumableTransaction,
  createConsumableWithStock,
  receiveConsumableStock,
  issueConsumableStock,
  getLowStockConsumables,
} from "../services/consumablesService";
import type { Consumable } from "../types/inventory";

// Query keys
export const CONSUMABLES_QUERY_KEY = "consumables";
export const CONSUMABLE_TRANSACTIONS_QUERY_KEY = "consumableTransactions";
export const LOW_STOCK_CONSUMABLES_QUERY_KEY = "lowStockConsumables";

// Consumables hooks
export const useConsumables = () => {
  return useQuery({
    queryKey: [CONSUMABLES_QUERY_KEY],
    queryFn: getConsumables,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useConsumableTransactions = () => {
  return useQuery({
    queryKey: [CONSUMABLE_TRANSACTIONS_QUERY_KEY],
    queryFn: getConsumableTransactions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLowStockConsumables = () => {
  return useQuery({
    queryKey: [LOW_STOCK_CONSUMABLES_QUERY_KEY],
    queryFn: getLowStockConsumables,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Consumables mutations
export const useAddConsumable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addConsumable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONSUMABLES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [LOW_STOCK_CONSUMABLES_QUERY_KEY],
      });
    },
  });
};

export const useUpdateConsumable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Consumable> }) =>
      updateConsumable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONSUMABLES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [LOW_STOCK_CONSUMABLES_QUERY_KEY],
      });
    },
  });
};

export const useDeleteConsumable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConsumable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONSUMABLES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CONSUMABLE_TRANSACTIONS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [LOW_STOCK_CONSUMABLES_QUERY_KEY],
      });
    },
  });
};

// Consumable transactions mutations
export const useAddConsumableTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addConsumableTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CONSUMABLE_TRANSACTIONS_QUERY_KEY],
      });
    },
  });
};

// Complex operations mutations
export const useCreateConsumableWithStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      consumable,
      initialQuantity,
      reference,
      notes,
    }: {
      consumable: Omit<Consumable, "id">;
      initialQuantity: number;
      supplier?: string;
      reference?: string;
      notes?: string;
    }) =>
      createConsumableWithStock(consumable, initialQuantity, reference, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONSUMABLES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CONSUMABLE_TRANSACTIONS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [LOW_STOCK_CONSUMABLES_QUERY_KEY],
      });
    },
  });
};

export const useReceiveConsumableStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      consumableId,
      quantity,
      unitCost,
      reference,
      notes,
    }: {
      consumableId: string;
      quantity: number;
      unitCost: number;
      supplier?: string;
      reference?: string;
      notes?: string;
    }) =>
      receiveConsumableStock(
        consumableId,
        quantity,
        unitCost,
        reference,
        notes
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONSUMABLES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CONSUMABLE_TRANSACTIONS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [LOW_STOCK_CONSUMABLES_QUERY_KEY],
      });
    },
  });
};

export const useIssueConsumableStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      consumableId,
      quantity,
      issuedTo,
      department,
      reason,
      reference,
      notes,
    }: {
      consumableId: string;
      quantity: number;
      issuedTo: string;
      department?: string;
      reason?: string;
      reference?: string;
      notes?: string;
    }) =>
      issueConsumableStock(
        consumableId,
        quantity,
        issuedTo,
        department,
        reason,
        reference,
        notes
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONSUMABLES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CONSUMABLE_TRANSACTIONS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [LOW_STOCK_CONSUMABLES_QUERY_KEY],
      });
    },
  });
};

// Combined hook for consumables management
export const useConsumablesManagement = () => {
  const consumables = useConsumables();
  const transactions = useConsumableTransactions();
  const lowStockConsumables = useLowStockConsumables();

  const addConsumableMutation = useAddConsumable();
  const updateConsumableMutation = useUpdateConsumable();
  const deleteConsumableMutation = useDeleteConsumable();
  const createConsumableWithStockMutation = useCreateConsumableWithStock();
  const receiveStockMutation = useReceiveConsumableStock();
  const issueStockMutation = useIssueConsumableStock();

  return {
    // Data
    consumables: consumables.data || [],
    transactions: transactions.data || [],
    lowStockConsumables: lowStockConsumables.data || [],

    // Loading states
    isLoadingConsumables: consumables.isLoading,
    isLoadingTransactions: transactions.isLoading,
    isLoadingLowStock: lowStockConsumables.isLoading,

    // Error states
    consumablesError: consumables.error,
    transactionsError: transactions.error,
    lowStockError: lowStockConsumables.error,

    // Mutations
    addConsumable: addConsumableMutation.mutateAsync,
    updateConsumable: updateConsumableMutation.mutateAsync,
    deleteConsumable: deleteConsumableMutation.mutateAsync,
    createConsumableWithStock: createConsumableWithStockMutation.mutateAsync,
    receiveStock: receiveStockMutation.mutateAsync,
    issueStock: issueStockMutation.mutateAsync,

    // Mutation states
    isAddingConsumable: addConsumableMutation.isPending,
    isUpdatingConsumable: updateConsumableMutation.isPending,
    isDeletingConsumable: deleteConsumableMutation.isPending,
    isCreatingConsumableWithStock: createConsumableWithStockMutation.isPending,
    isReceivingStock: receiveStockMutation.isPending,
    isIssuingStock: issueStockMutation.isPending,
  };
};
