
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function EnhancedHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-luxury-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-luxury-gold/5 to-transparent rounded-full"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-luxury-gold/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <div className="mb-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-luxury-gold/10 border border-luxury-gold/20 rounded-full text-luxury-gold text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Premium Fashion Collection
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-luxury-white mb-8 animate-fade-in-up animation-delay-200">
          <span className="block">Luxury</span>
          <span className="text-gradient bg-gradient-to-r from-luxury-gold to-yellow-300 bg-clip-text text-transparent">
            Redefined
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
          Discover our exclusive collection of premium fashion pieces, crafted with 
          unparalleled attention to detail and timeless elegance.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animation-delay-600">
          <Link to="/products">
            <Button 
              size="lg" 
              className="bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-black font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-luxury-gold/25 group"
            >
              Explore Collection
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold/10 px-8 py-4 text-lg rounded-full backdrop-blur-sm transition-all duration-300"
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 animate-fade-in-up animation-delay-800">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-luxury-gold mb-2">500+</div>
            <div className="text-gray-400 text-sm">Premium Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-luxury-gold mb-2">50K+</div>
            <div className="text-gray-400 text-sm">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-luxury-gold mb-2">25+</div>
            <div className="text-gray-400 text-sm">Countries</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-luxury-gold/50 rounded-full p-1">
          <div className="w-1 h-3 bg-luxury-gold rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
