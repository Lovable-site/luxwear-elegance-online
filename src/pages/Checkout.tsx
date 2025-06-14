
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const Checkout = () => {
  // In a fuller version, fetch cart, summary, and user info here.
  // For now, show a simple confirmation and a "Pay Now" placeholder.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <ShoppingCart className="h-8 w-8 text-luxury-gold" />
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-base text-gray-600">Product</span>
              <span className="text-base font-semibold text-gray-900">Elegance Silk Dress</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-base text-gray-600">Subtotal</span>
              <span>$749.00</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-base text-gray-600">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-base text-gray-600">Total</span>
              <span className="font-bold text-luxury-gold text-lg">$749.00</span>
            </div>
          </div>
          <Button className="w-full bg-luxury-gold text-black font-semibold flex gap-2 items-center mb-2" size="lg" disabled>
            <CreditCard className="h-5 w-5" />
            Pay Now
          </Button>
          <Link to="/cart">
            <Button variant="outline" className="w-full" size="lg">Back to Cart</Button>
          </Link>
          <p className="text-center text-xs text-gray-400 mt-4">* Payment functionality coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;

