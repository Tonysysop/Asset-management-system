import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLicenses,
  addLicense,
  addLicenses,
  updateLicense,
  deleteLicense,
} from "../services/licenseService";
import type { License } from "../types/inventory";

// Query keys
export const licenseKeys = {
  all: ["licenses"] as const,
  lists: () => [...licenseKeys.all, "list"] as const,
  list: (filters: string) => [...licenseKeys.lists(), { filters }] as const,
  details: () => [...licenseKeys.all, "detail"] as const,
  detail: (id: string) => [...licenseKeys.details(), id] as const,
};

// Hooks for fetching data
export const useLicenses = () => {
  return useQuery({
    queryKey: licenseKeys.lists(),
    queryFn: getLicenses,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Mutation hooks for data modification
export const useAddLicense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      license,
      user,
    }: {
      license: Omit<License, "id">;
      user: string;
    }) => addLicense(license, user),
    onSuccess: () => {
      // Invalidate and refetch licenses
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
    },
  });
};

export const useAddLicenses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      licenses,
      user,
    }: {
      licenses: Omit<License, "id">[];
      user: string;
    }) => addLicenses(licenses, user),
    onSuccess: () => {
      // Invalidate and refetch licenses
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
    },
  });
};

export const useUpdateLicense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      license,
      user,
    }: {
      id: string;
      license: Partial<License>;
      user: string;
    }) => updateLicense(id, license, user),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch licenses
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: licenseKeys.detail(id) });
    },
  });
};

export const useDeleteLicense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: string }) =>
      deleteLicense(id, user),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch licenses
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: licenseKeys.detail(id) });
    },
  });
};
