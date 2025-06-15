
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Fashion Blogger",
    avatar: "/placeholder.svg",
    rating: 5,
    content: "Absolutely stunning collection! The quality exceeded my expectations and the customer service was exceptional."
  },
  {
    name: "Michael Chen",
    role: "Style Enthusiast",
    avatar: "/placeholder.svg",
    rating: 5,
    content: "Premium quality materials and impeccable craftsmanship. This is my go-to store for luxury fashion."
  },
  {
    name: "Emma Rodriguez",
    role: "Fashion Designer",
    avatar: "/placeholder.svg",
    rating: 5,
    content: "The attention to detail is remarkable. Every piece tells a story of elegance and sophistication."
  }
];

export function EnhancedTestimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-luxury-gold/3 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-luxury-white mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover why customers worldwide trust our luxury fashion collection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="bg-white/10 backdrop-blur-sm border border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300 transform hover:-translate-y-2"
            >
              <CardContent className="p-8">
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-luxury-gold mb-4" />
                  <p className="text-gray-200 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-luxury-gold text-luxury-gold" />
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-luxury-gold text-luxury-black font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-luxury-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
