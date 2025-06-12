
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";

const Index = () => {
  // Mock featured products data
  const featuredProducts = [
    {
      id: 1,
      name: "Elegance Silk Dress",
      price: 299,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop",
      category: "women"
    },
    {
      id: 2,
      name: "Classic Wool Blazer",
      price: 450,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop",
      category: "men"
    },
    {
      id: 3,
      name: "Premium Leather Handbag",
      price: 189,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=600&fit=crop",
      category: "accessories"
    },
    {
      id: 4,
      name: "Cashmere Sweater",
      price: 320,
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=600&fit=crop",
      category: "women"
    }
  ];

  const collections = [
    {
      title: "Women's Collection",
      description: "Elegant and sophisticated pieces for the modern woman",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop",
      link: "/products?category=women"
    },
    {
      title: "Men's Collection",
      description: "Refined style and timeless elegance for gentlemen",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
      link: "/products?category=men"
    },
    {
      title: "Accessories",
      description: "Premium accessories to complete your luxury look",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop",
      link: "/products?category=accessories"
    }
  ];

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
          <div className="space-x-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/products">
              <Button size="lg" className="bg-luxury-gold text-black hover:bg-yellow-400 font-semibold px-8 py-3">
                Shop Collection
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="aspect-[3/4] relative">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 className="text-2xl font-heading font-bold mb-2">
                      {collection.title}
                    </h3>
                    <p className="text-gray-200 mb-4">
                      {collection.description}
                    </p>
                    <Link to={collection.link}>
                      <Button className="bg-luxury-gold text-black hover:bg-yellow-400 font-semibold">
                        Explore Collection
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

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
