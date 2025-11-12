import React from "react";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/LoginForm";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div
        className="min-h-screen bg-bua-dark-blue flex items-center justify-center p-4"
        style={{
          background:
            "radial-gradient(circle, rgba(227,6,19,0.2) 0%, rgba(0,0,32,1) 70%)",
        }}
      >
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
