
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
}

interface EnhancedProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export function EnhancedProductGrid({ products, onAddToCart, onViewProduct }: EnhancedProductGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => (
        <Card 
          key={product.id} 
          className="group cursor-pointer bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
        >
          <CardContent className="p-0">
            {/* Image Container */}
            <div className="relative overflow-hidden">
              <AspectRatio ratio={4/5}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </AspectRatio>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isNew && (
                  <Badge className="bg-luxury-gold text-luxury-black font-semibold">NEW</Badge>
                )}
                {product.isSale && (
                  <Badge variant="destructive" className="font-semibold">SALE</Badge>
                )}
              </div>

              {/* Quick Actions */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                >
                  <Heart 
                    className={`h-4 w-4 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProduct(product);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Add to Cart Button */}
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                <Button
                  className="w-full bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-black font-semibold rounded-full shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-luxury-black transition-colors">
                {product.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) 
                        ? 'fill-luxury-gold text-luxury-gold' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-luxury-black">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
