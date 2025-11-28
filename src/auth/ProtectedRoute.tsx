import react from "react";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { Navigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
    const { goHome } = useAppNavigation();
    const dispatch = useAppDispatch();
    const authState = useAppSelector((state) => state.auth);

  
  const userRole = authState.userRole;
  const isAuthenticated= authState.isAuthenticated;
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />

  }

  // Check if user is authenticated and has the required role
  if (isAuthenticated && userRole && allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  return <div>Access Denied</div>;
};
export default ProtectedRoute;
