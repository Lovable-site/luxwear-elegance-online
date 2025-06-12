
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-luxury-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold text-luxury-gold">
              LuxuriqWear
            </h3>
            <p className="text-gray-300 text-sm">
              Discover luxury fashion with our curated collection of premium clothing 
              and accessories for the discerning fashion enthusiast.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-heading font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/products" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-200">
                Collections
              </Link>
              <Link to="/products?category=women" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-200">
                Women
              </Link>
              <Link to="/products?category=men" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-200">
                Men
              </Link>
              <Link to="/products?category=accessories" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-200">
                Accessories
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-heading font-semibold">Customer Service</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-200">
                Contact Us
              </a>
              <a href="#" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-200">
                Size Guide
              </a>
              <a href="#" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-200">
                Shipping Info
              </a>
              <a href="#" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-200">
                Returns
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-heading font-semibold">Stay Connected</h4>
            <p className="text-gray-300 text-sm">
              Subscribe to receive updates on new collections and exclusive offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-luxury-gold"
              />
              <button className="px-4 py-2 bg-luxury-gold text-black font-semibold rounded-r-md hover:bg-yellow-400 transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 LuxuriqWear. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
