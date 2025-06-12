
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingBag, Share2, Shield, Truck, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mainImage, setMainImage] = useState(0);

  // Mock product data
  const product = {
    id: parseInt(id || "1"),
    name: "Elegance Silk Dress",
    price: 299,
    originalPrice: 399,
    description: "Exquisite silk dress crafted with meticulous attention to detail. This timeless piece embodies elegance and sophistication, perfect for special occasions or elevated everyday wear.",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1566479179817-66c1fd875aa0?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1551803091-e20673f15561?w=600&h=800&fit=crop"
    ],
    category: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Navy", value: "#1e3a8a" },
      { name: "Burgundy", value: "#7c2d12" }
    ],
    inStock: true,
    features: [
      "100% Pure Silk",
      "Hand-finished seams",
      "Italian craftsmanship",
      "Sustainable production"
    ],
    care: "Dry clean only. Store in garment bag.",
    sizing: "True to size. Model is 5'9\" wearing size S.",
    shipping: "Free shipping on orders over $200. Express delivery available."
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }
    toast.success(`Added ${product.name} to cart`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[mainImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
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
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2 capitalize">
                {product.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-luxury-gold">
                  ${product.price}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                    <Badge variant="destructive">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selection */}
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

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex space-x-3">
                {product.colors.map((color) => (
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
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:border-luxury-gold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full bg-luxury-gold text-black hover:bg-yellow-400 font-semibold py-3"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart - ${product.price * quantity}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  size="lg"
                  className={`${
                    isWishlisted ? "border-red-500 text-red-500" : "border-gray-300"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 mr-2 ${
                      isWishlisted ? "fill-red-500" : ""
                    }`}
                  />
                  Wishlist
                </Button>
                
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <Shield className="h-4 w-4 mr-2 text-luxury-gold" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="sizing">Size Guide</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  {product.description}
                </p>
                <h4 className="text-lg font-semibold mb-2">Care Instructions</h4>
                <p className="text-gray-600">{product.care}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="sizing" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4">{product.sizing}</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Size Chart</h4>
                  <p className="text-sm text-gray-600">
                    Please refer to our detailed size guide for the best fit. 
                    If you're between sizes, we recommend sizing up.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-600">{product.shipping}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm"><strong>Standard Delivery:</strong> 3-5 business days</p>
                  <p className="text-sm"><strong>Express Delivery:</strong> 1-2 business days</p>
                  <p className="text-sm"><strong>International:</strong> 7-14 business days</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
