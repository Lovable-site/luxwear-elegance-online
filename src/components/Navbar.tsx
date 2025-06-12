
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = 0; // This will be managed by cart context later
  const wishlistItems = 0; // This will be managed by wishlist context later

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/products" 
              className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
            >
              Collections
            </Link>
            <Link 
              to="/products?category=women" 
              className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
            >
              Women
            </Link>
            <Link 
              to="/products?category=men" 
              className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
            >
              Men
            </Link>
            <Link 
              to="/products?category=accessories" 
              className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
            >
              Accessories
            </Link>
          </div>

          {/* Action Items */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishlistItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-luxury-gold text-black text-xs flex items-center justify-center">
                  {wishlistItems}
                </Badge>
              )}
            </Button>

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
                to="/products" 
                className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Collections
              </Link>
              <Link 
                to="/products?category=women" 
                className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Women
              </Link>
              <Link 
                to="/products?category=men" 
                className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Men
              </Link>
              <Link 
                to="/products?category=accessories" 
                className="text-gray-800 hover:text-luxury-gold transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accessories
              </Link>
              
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-luxury-gold text-black text-xs flex items-center justify-center">
                      {wishlistItems}
                    </Badge>
                  )}
                </Button>

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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
