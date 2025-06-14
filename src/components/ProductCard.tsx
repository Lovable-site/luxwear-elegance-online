
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isLoading: wishLoading } = useWishlist();

  const isWishlisted = wishlist.includes(String(product.id));

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to use your wishlist.");
      return;
    }
    if (isWishlisted) {
      await removeFromWishlist(String(product.id));
    } else {
      await addToWishlist(String(product.id));
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('[ProductCard] Adding product to cart:', product);
      
      const cartItem = {
        id: product.id, // Keep the original ID type (string or number)
        name: product.name,
        price: product.price,
        image: product.image,
        size: "M", // Default size
        color: "Default",
        quantity: 1
      };

      console.log('[ProductCard] Cart item being added:', cartItem);
      addToCart(cartItem);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error('[ProductCard] Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={wishLoading}
          className={cn(
            "absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200",
            wishLoading ? "opacity-50 pointer-events-none" : ""
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors duration-200",
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
            )}
          />
        </button>

        {/* Quick Add to Cart - appears on hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full bg-luxury-gold text-black hover:bg-yellow-400 font-semibold"
          >
            {isLoading ? (
              "Adding..."
            ) : (
              <>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Quick Add
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-heading font-semibold text-gray-900 mb-2 hover:text-luxury-gold transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-2 capitalize">{product.category}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-luxury-gold">
            ${product.price}
          </span>
          <span className="text-sm text-gray-400">Free Shipping</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
