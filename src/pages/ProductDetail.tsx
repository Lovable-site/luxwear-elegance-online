import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Share2, Shield, Truck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  tags: string[];
  stock_quantity: number;
  categories: { name: string } | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  // Default colors (since we don't have colors in the database yet)
  const defaultColors = [
    { name: "Black", value: "#000000" },
    { name: "Navy", value: "#1e3a8a" },
    { name: "Burgundy", value: "#7c2d12" }
  ];

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          images,
          sizes,
          tags,
          stock_quantity,
          categories (name)
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.svg',
      size: selectedSize || "One Size",
      color: selectedColor,
      quantity: quantity
    };

    addToCart(cartItem);
    toast.success(`Added ${product.name} to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[mainImage] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      mainImage === index ? "border-luxury-gold" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2 capitalize">
                {product.categories?.name || 'Uncategorized'}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-luxury-gold">
                  ${product.price}
                </span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {product.description || "This premium product combines exceptional quality with timeless style."}
            </p>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Size</h3>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-4 border rounded-md text-center transition-all duration-200 ${
                        selectedSize === size
                          ? "border-luxury-gold bg-luxury-gold text-black"
                          : "border-gray-300 hover:border-luxury-gold"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex space-x-3">
                {defaultColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-12 h-12 rounded-full border-4 transition-all duration-200 ${
                      selectedColor === color.name
                        ? "border-luxury-gold scale-110"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              {selectedColor && (
                <p className="text-sm text-gray-600 mt-2">Selected: {selectedColor}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:border-luxury-gold transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:border-luxury-gold transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {product.stock_quantity} items available
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                disabled={product.stock_quantity === 0}
                className="w-full bg-luxury-gold text-black hover:bg-yellow-400 font-semibold py-3"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {product.stock_quantity === 0 ? 'Out of Stock' : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
              </Button>
              
              <Button variant="outline" size="lg" className="w-full">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>

            {/* Features */}
            {product.tags.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <ul className="space-y-2">
                  {product.tags.map((tag, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <Shield className="h-4 w-4 mr-2 text-luxury-gold" />
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shipping & Returns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-t">
              <div className="flex items-center space-x-3">
                <Truck className="h-6 w-6 text-luxury-gold" />
                <div>
                  <p className="font-semibold text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-600">Orders over $200</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-6 w-6 text-luxury-gold" />
                <div>
                  <p className="font-semibold text-sm">Easy Returns</p>
                  <p className="text-xs text-gray-600">30-day policy</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-luxury-gold" />
                <div>
                  <p className="font-semibold text-sm">Authentic</p>
                  <p className="text-xs text-gray-600">Guaranteed genuine</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  {product.description || "This premium product combines exceptional quality with timeless style."}
                </p>
                <h4 className="text-lg font-semibold mb-2">Care Instructions</h4>
                <p className="text-gray-600">Dry clean only. Store in garment bag.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
