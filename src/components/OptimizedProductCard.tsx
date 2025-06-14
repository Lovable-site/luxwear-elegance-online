
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import LazyImage from './LazyImage';
import { usePreloadRoutes } from '@/hooks/usePreloadRoutes';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  is_featured?: boolean;
  stock_quantity?: number;
}

interface OptimizedProductCardProps {
  product: Product;
}

const OptimizedProductCard: React.FC<OptimizedProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { preloadRoute } = usePreloadRoutes();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      quantity: 1,
    });
  };

  const handleMouseEnter = () => {
    // Preload product detail route on hover
    preloadRoute('/products');
  };

  return (
    <Card 
      className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <LazyImage
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full"
          />
          
          {product.is_featured && (
            <Badge className="absolute top-2 left-2 bg-luxury-gold text-black">
              Featured
            </Badge>
          )}
          
          {product.stock_quantity === 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
              Out of Stock
            </Badge>
          )}

          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-luxury-gold transition-colors">
            {product.name}
          </h3>
          <p className="text-2xl font-bold text-luxury-gold">
            ${product.price.toFixed(2)}
          </p>
          {product.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {product.description}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};

export default OptimizedProductCard;
