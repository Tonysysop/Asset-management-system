import { createContext } from "react";
import type { User } from "firebase/auth";
import type { UserRole } from "../types/inventory";

export interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
