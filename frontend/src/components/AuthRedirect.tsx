import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AuthRedirect = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthRedirect;
