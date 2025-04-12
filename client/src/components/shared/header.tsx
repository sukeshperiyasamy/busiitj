import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import iitLogo from "@assets/Design of New Logo of IITJ-2 PNG BW.png";

interface HeaderProps {
  title?: string;
  showLogout?: boolean;
  busNumber?: string;
}

export function Header({ title, showLogout = true, busNumber }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-primary text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={iitLogo}
            alt="IIT Jodhpur Logo"
            className="h-10 mr-3 invert"
          />
          <h1 className="text-xl font-bold">IIT Jodhpur Bus Tracker</h1>
        </div>
        <div className="flex items-center">
          {user && (
            <span className="mr-4">
              {busNumber ? `${busNumber}` : `${title || user.role}`}
            </span>
          )}
          {showLogout && (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center text-sm bg-primary-dark border-white/10 text-white hover:bg-blue-800 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
