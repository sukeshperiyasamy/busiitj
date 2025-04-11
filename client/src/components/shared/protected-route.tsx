import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: string | string[];
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Check role if specified
  if (role && user) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      // Redirect based on actual role
      if (user.role === "admin") {
        return <Redirect to="/admin" />;
      } else if (user.role === "driver") {
        return <Redirect to="/driver" />;
      } else {
        return <Redirect to="/student" />;
      }
    }
  }

  // Render the protected component
  return <>{children}</>;
}
