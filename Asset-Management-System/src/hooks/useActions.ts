import { useQuery } from "@tanstack/react-query";
import { getActions } from "../services/actionService";
//import type { Action } from "../types/inventory";

// Query keys
export const actionKeys = {
  all: ["actions"] as const,
  lists: () => [...actionKeys.all, "list"] as const,
  list: (filters: string) => [...actionKeys.lists(), { filters }] as const,
};

// Hooks for fetching data
export const useActions = () => {
  return useQuery({
    queryKey: actionKeys.lists(),
    queryFn: getActions,
    staleTime: 1 * 60 * 1000, // 1 minute (audit trail should be more fresh)
  });
};
