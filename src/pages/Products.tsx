
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  categories: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_curated: boolean;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, image_url, is_curated')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory !== "all") {
      const categoryName = categories.find(cat => cat.id === selectedCategory)?.name;
      matchesCategory = product.categories?.name === categoryName;
    }
    
    let matchesPrice = true;
    if (priceRange === "under-200") matchesPrice = product.price < 200;
    else if (priceRange === "200-500") matchesPrice = product.price >= 200 && product.price <= 500;
    else if (priceRange === "500-1000") matchesPrice = product.price >= 500 && product.price <= 1000;
    else if (priceRange === "over-1000") matchesPrice = product.price > 1000;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-luxury-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Premium Collections
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover our curated selection of luxury fashion pieces crafted for those who appreciate exceptional quality and timeless style.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Grid */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-4xl font-bold">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-luxury-gold transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    {category.is_curated && (
                      <span className="inline-block mt-2 px-2 py-1 bg-luxury-gold text-black text-xs font-semibold rounded">
                        Curated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-200">Under $200</SelectItem>
                <SelectItem value="200-500">$200 - $500</SelectItem>
                <SelectItem value="500-1000">$500 - $1000</SelectItem>
                <SelectItem value="over-1000">Over $1000</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {sortedProducts.length} of {products.length} products
          </p>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images[0] || '/placeholder.svg',
                  category: product.categories?.name || 'Uncategorized'
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setPriceRange("all");
                searchParams.delete("category");
                setSearchParams(searchParams);
              }}
              className="mt-4"
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More Button */}
        {sortedProducts.length > 0 && sortedProducts.length < products.length && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black"
            >
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
