
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useCartSync } from "@/hooks/useCartSync";
import { useCartPersistence } from "@/hooks/useCartPersistence";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  
  // Initialize cart persistence and syncing
  useCartPersistence();
  useCartSync();
  
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [taxRate, setTaxRate] = useState<number>(0.08);

  // Get tax rate from admin settings on mount
  useEffect(() => {
    async function fetchAdminTaxRate() {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('tax_rate')
          .limit(1)
          .maybeSingle();
        if (!error && data?.tax_rate != null) {
          setTaxRate(Number(data.tax_rate) / 100);
        }
      } catch (e) {
        // ignore, fallback to default
      }
    }
    fetchAdminTaxRate();
  }, []);

  const handleUpdateQuantity = (id: string, size: string, newQuantity: number) => {
    updateQuantity(id, size, newQuantity);
    if (newQuantity <= 0) {
      toast.success("Item removed from cart");
    }
  };

  const handleRemoveItem = (id: string, size: string) => {
    removeFromCart(id, size);
    toast.success("Item removed from cart");
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "luxury10") {
      setAppliedPromo("LUXURY10");
      toast.success("Promo code applied! 10% discount");
    } else {
      toast.error("Invalid promo code");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = appliedPromo === "LUXURY10" ? subtotal * 0.1 : 0;
  const shipping = subtotal > 200 ? 0 : 25;
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Discover our luxury collection and add some items to your cart.
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-luxury-gold text-black hover:bg-yellow-400 font-semibold">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} item{cartItems.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${item.size}-${index}`} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-32 object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Size: {item.size} • Color: {item.color}
                    </p>
                    <p className="text-lg font-bold text-luxury-gold">
                      ${item.price}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.size, item.quantity - 1)}
                        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:border-luxury-gold transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.size, item.quantity + 1)}
                        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:border-luxury-gold transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id, item.size)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={!!appliedPromo}
                  />
                  <Button
                    onClick={applyPromoCode}
                    variant="outline"
                    disabled={!!appliedPromo}
                  >
                    Apply
                  </Button>
                </div>
                {appliedPromo && (
                  <p className="text-sm text-green-600 mt-1">
                    Code "{appliedPromo}" applied!
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax {`(${(taxRate * 100).toFixed(2)}%)`}</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-luxury-gold">${total.toFixed(2)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-sm text-gray-500 mt-3">
                  Add ${(200 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}

              <Button
                size="lg"
                asChild
                className="w-full mt-6 bg-luxury-gold text-black hover:bg-yellow-400 font-semibold"
              >
                <Link to="/checkout">
                  Go to Checkout
                </Link>
              </Button>

              <Link to="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mt-3"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
