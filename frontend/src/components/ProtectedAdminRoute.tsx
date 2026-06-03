import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate } from "react-router-dom";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user, isAdmin } = useAuthStore();

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
