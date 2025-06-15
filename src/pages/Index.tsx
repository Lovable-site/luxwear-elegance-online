import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  categories: { name: string } | null;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  is_curated: boolean;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCuratedCollections();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          images,
          categories (name)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(4)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      toast.error('Failed to load featured products');
    }
  };

  const fetchCuratedCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, image_url, is_curated')
        .eq('is_curated', true)
        .limit(3)
        .order('name');

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching curated collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCollectionImage = (collection: Collection) => {
    // Use the uploaded image if available, otherwise fallback to placeholder
    if (collection.image_url) {
      return collection.image_url;
    }
    
    // Fallback images based on collection name
    const imageMap: { [key: string]: string } = {
      'women': "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop",
      'men': "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
      'accessories': "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop",
    };
    
    return imageMap[collection.name.toLowerCase()] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop";
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 animate-fade-in-up">
            Luxury
            <span className="text-luxury-gold"> Redefined</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Discover premium fashion that speaks to your sophisticated taste
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/products">
              <Button size="lg" className="bg-luxury-gold text-black hover:bg-yellow-400 font-semibold px-8 py-3">
                Shop Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Curated Collections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Curated Collections
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our meticulously selected collections designed for those who appreciate the finer things in life.
            </p>
          </div>

          {collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {collections.map((collection, index) => (
                <div key={collection.id} className="group relative overflow-hidden rounded-lg animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="aspect-[3/4] relative">
                    <img
                      src={getCollectionImage(collection)}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                      <h3 className="text-2xl font-heading font-bold mb-2">
                        {collection.name}
                      </h3>
                      <p className="text-gray-200 mb-4">
                        {collection.description || "Discover our premium collection"}
                      </p>
                      <Link to={`/products?category=${collection.id}`}>
                        <Button className="bg-luxury-gold text-black hover:bg-yellow-400 font-semibold">
                          Explore Collection
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No curated collections available</p>
              <p className="text-sm text-gray-400 mt-2">Mark collections as curated through the admin panel</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked pieces that embody elegance, quality, and timeless style.
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <div key={product.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard 
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.images[0] || '/placeholder.svg',
                      category: product.categories?.name || 'Uncategorized'
                    }} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured products available</p>
              <p className="text-sm text-gray-400 mt-2">Add products through the admin panel and mark them as featured</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black font-semibold px-8 py-3">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 bg-luxury-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-right">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                Our <span className="text-luxury-gold">Story</span>
              </h2>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                LuxuriqWear was born from a passion for exceptional craftsmanship and timeless design. 
                We believe that true luxury lies not just in premium materials, but in the attention 
                to detail and the story behind each piece.
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Every item in our collection is carefully curated to ensure it meets our exacting 
                standards of quality, style, and sophistication.
              </p>
              <Button className="bg-luxury-gold text-black hover:bg-yellow-400 font-semibold px-8 py-3">
                Discover Our Heritage
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=800&fit=crop"
                alt="Luxury fashion atelier"
                className="w-full h-96 lg:h-[500px] object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
