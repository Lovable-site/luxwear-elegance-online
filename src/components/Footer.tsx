import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-luxury-black text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-3xl font-heading font-bold text-luxury-gold">
              LuxuriqWear
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover luxury fashion with our curated collection of premium clothing and accessories for the discerning fashion enthusiast.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xl font-heading font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-luxury-gold transition duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-luxury-gold transition duration-300"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-luxury-gold transition duration-300"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>


          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-xl font-heading font-semibold text-white">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-luxury-gold transition duration-300"
                >
                  Size Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-luxury-gold transition duration-300"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-luxury-gold transition duration-300"
                >
                  Returns
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 LuxuriqWear. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
