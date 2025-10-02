import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAssets,
  getRetrievedAssets,
  addAsset,
  addAssets,
  updateAsset,
  deleteAsset,
  moveAssetToRetrieved,
  deleteRetrievedAsset,
  generateAssetTag,
} from "../services/assetService";
import type { Asset, RetrievedAsset } from "../types/inventory";

// Query keys
export const assetKeys = {
  all: ["assets"] as const,
  lists: () => [...assetKeys.all, "list"] as const,
  list: (filters: string) => [...assetKeys.lists(), { filters }] as const,
  details: () => [...assetKeys.all, "detail"] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
  retrieved: () => [...assetKeys.all, "retrieved"] as const,
};

// Hooks for fetching data
export const useAssets = () => {
  return useQuery({
    queryKey: assetKeys.lists(),
    queryFn: getAssets,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRetrievedAssets = () => {
  return useQuery({
    queryKey: assetKeys.retrieved(),
    queryFn: getRetrievedAssets,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAssetTag = (assetType: string, deployedDate?: Date) => {
  return useQuery({
    queryKey: ["assetTag", assetType, deployedDate?.getFullYear()],
    queryFn: () => generateAssetTag(assetType, deployedDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!assetType,
  });
};

// Mutation hooks for data modification
export const useAddAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ asset, user }: { asset: Omit<Asset, "id">; user: string }) =>
      addAsset(asset, user),
    onMutate: async ({ asset }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: assetKeys.lists() });

      // Snapshot the previous value
      const previousAssets = queryClient.getQueryData(assetKeys.lists());

      // Optimistically update to the new value
      const optimisticAsset = { ...asset, id: `temp-${Date.now()}` };
      queryClient.setQueryData(assetKeys.lists(), (old: Asset[] = []) => [
        ...old,
        optimisticAsset,
      ]);

      // Return a context object with the snapshotted value
      return { previousAssets };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAssets) {
        queryClient.setQueryData(assetKeys.lists(), context.previousAssets);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
};

export const useAddAssets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assets,
      user,
    }: {
      assets: Omit<Asset, "id">[];
      user: string;
    }) => addAssets(assets, user),
    onSuccess: () => {
      // Invalidate and refetch assets
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      asset,
      user,
    }: {
      id: string;
      asset: Partial<Asset>;
      user: string;
    }) => updateAsset(id, asset, user),
    onMutate: async ({ id, asset }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: assetKeys.lists() });

      // Snapshot the previous value
      const previousAssets = queryClient.getQueryData(assetKeys.lists());

      // Optimistically update to the new value
      queryClient.setQueryData(assetKeys.lists(), (old: Asset[] = []) =>
        old.map((item) => (item.id === id ? { ...item, ...asset } : item))
      );

      // Return a context object with the snapshotted value
      return { previousAssets };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAssets) {
        queryClient.setQueryData(assetKeys.lists(), context.previousAssets);
      }
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(id) });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: string }) =>
      deleteAsset(id, user),
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: assetKeys.lists() });

      // Snapshot the previous value
      const previousAssets = queryClient.getQueryData(assetKeys.lists());

      // Optimistically update to the new value
      queryClient.setQueryData(assetKeys.lists(), (old: Asset[] = []) =>
        old.filter((item) => item.id !== id)
      );

      // Return a context object with the snapshotted value
      return { previousAssets };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAssets) {
        queryClient.setQueryData(assetKeys.lists(), context.previousAssets);
      }
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(id) });
    },
  });
};

export const useRetrieveAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      retrieved,
      user,
    }: {
      id: string;
      retrieved: Omit<RetrievedAsset, "id">;
      user: string;
    }) => moveAssetToRetrieved(id, retrieved, user),
    onSuccess: () => {
      // Invalidate both assets and retrieved assets
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetKeys.retrieved() });
    },
  });
};

export const useDeleteRetrievedAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: string }) =>
      deleteRetrievedAsset(id, user),
    onSuccess: () => {
      // Invalidate retrieved assets
      queryClient.invalidateQueries({ queryKey: assetKeys.retrieved() });
    },
  });
};
