
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Shield, Store } from "lucide-react";

const AuthenticatedNavbar = () => {
  const { userRole, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-heading font-bold text-gradient">
              LuxuriqWear
            </h1>
          </Link>

          {/* Navigation based on role */}
          <div className="flex items-center space-x-4">
            {userRole === 'admin' && (
              <>
                <Link to="/admin">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin Panel</span>
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Store className="h-4 w-4" />
                    <span className="hidden sm:inline">View Store</span>
                  </Button>
                </Link>
              </>
            )}
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;
