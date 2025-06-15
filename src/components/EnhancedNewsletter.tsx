
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function EnhancedNewsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Welcome to our exclusive newsletter! Check your email for a special discount.");
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-luxury-gold via-yellow-400 to-luxury-gold relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-luxury-gold/10 rounded-full text-luxury-black text-sm font-medium mb-6">
                <Gift className="w-4 h-4" />
                Exclusive Offer
              </div>
              
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
                Join Our VIP Club
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Subscribe to our newsletter and get 20% off your first order plus exclusive access to new collections
              </p>

              <div className="flex items-center justify-center gap-8 mb-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-luxury-gold" />
                  Early Access
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-luxury-gold" />
                  Exclusive Discounts
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-luxury-gold" />
                  Style Tips
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-300 focus:border-luxury-gold rounded-full px-6"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 bg-luxury-black hover:bg-gray-800 text-white font-semibold px-8 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe Now"}
              </Button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-4">
              By subscribing, you agree to our privacy policy. Unsubscribe at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
