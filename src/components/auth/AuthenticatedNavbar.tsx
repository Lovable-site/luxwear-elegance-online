import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Shield, ShoppingBag, Menu, X } from "lucide-react";
import { logo } from "@/assets/luxuriq-logo.jpeg"

const AuthenticatedNavbar = () => {
  const { user, userRole, signOut, refreshUserRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = 0; // This will be managed by cart context later

  // Debug logging
  useEffect(() => {
    console.log('AuthenticatedNavbar - User:', user?.email);
    console.log('AuthenticatedNavbar - UserRole:', userRole);
  }, [user, userRole]);

  // Refresh user role on component mount to ensure we have the latest role
  useEffect(() => {
    if (user && !userRole) {
      console.log('Refreshing user role for:', user.email);
      refreshUserRole();
    }
  }, [user, userRole, refreshUserRole]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="LuxuriqWear Logo" className="h-10 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
            >
              Products
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>

          {/* Action Items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <span className="text-xs text-gray-500">
                Role: {userRole || 'loading...'}
              </span>
            )}

            {userRole === 'admin' && (
              <>
                <Link to="/admin">
                  <Button variant="outline" className="flex items-center space-x-2 bg-luxury-gold/10 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black">
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
              </>
            )}

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-luxury-gold text-black text-xs flex items-center justify-center">
                    {cartItems}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              
              <div className="flex flex-col space-y-4 pt-4 border-t border-gray-200">
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <span className="text-xs text-gray-500">
                    Role: {userRole || 'loading...'}
                  </span>
                )}

                {userRole === 'admin' && (
                  <>
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full flex items-center space-x-2 bg-luxury-gold/10 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black">
                        <Shield className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Button>
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-4">
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="icon" className="relative">
                      <ShoppingBag className="h-5 w-5" />
                      {cartItems > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-luxury-gold text-black text-xs flex items-center justify-center">
                          {cartItems}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </div>

                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;
