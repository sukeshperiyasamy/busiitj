import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./lib/auth";

import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import AdminDashboard from "@/pages/admin/dashboard";
import DriverDashboard from "@/pages/driver/dashboard";
import StudentDashboard from "@/pages/student/dashboard";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/components/shared/protected-route";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          <Route path="/admin">
            {() => (
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route path="/driver">
            {() => (
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route path="/student">
            {() => (
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            )}
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
