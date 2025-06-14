import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShoppingCart, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useCartPersistence } from "@/hooks/useCartPersistence";
import { supabase } from "@/integrations/supabase/client";

type ShippingFields = {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

const initialShipping = { fullName: "", address: "", city: "", postalCode: "", country: "" };

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { createOrder } = useCartPersistence();
  const [shipping, setShipping] = useState<ShippingFields>(initialShipping);
  const [errors, setErrors] = useState<Partial<ShippingFields>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [taxRate, setTaxRate] = useState<number>(0.08); // default fallback 8%

  const navigate = useNavigate();

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

  // Price calculations (now using dynamic tax rate)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal > 500 ? subtotal * 0.1 : 0;
  const shippingCost = subtotal > 200 ? 0 : 25;
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + shippingCost + tax;

  // On load, redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderSuccess) {
      navigate("/cart");
    }
  }, [cartItems, navigate, orderSuccess]);

  // Validation
  function validate(data: ShippingFields) {
    const errs: Partial<ShippingFields> = {};
    if (!data.fullName.trim()) errs.fullName = "Full name required";
    if (!data.address.trim()) errs.address = "Address required";
    if (!data.city.trim()) errs.city = "City required";
    if (!data.postalCode.trim()) errs.postalCode = "Postal code required";
    if (!data.country.trim()) errs.country = "Country required";
    return errs;
  }

  // Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    const fieldErrors = validate(shipping);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);

    try {
      // Create order in database
      await createOrder({
        street: shipping.address,
        city: shipping.city,
        state: shipping.country, // Using country as state for simplicity
        zip: shipping.postalCode,
        full_name: shipping.fullName
      });

      // Clear cart and show success
      clearCart();
      setOrderSuccess(true);
      toast.success("Order placed successfully! Confirmation will be sent to your email.");
      setShipping(initialShipping);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="flex flex-row items-center gap-4">
            <ShoppingCart className="h-8 w-8 text-luxury-gold" />
            <CardTitle>Order Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-5 text-center">
              <div className="text-2xl font-bold mb-2 text-green-600">Thank you!</div>
              <div>Your order has been placed successfully and will be processed soon.</div>
            </div>
            <Link to="/">
              <Button className="w-full bg-luxury-gold text-black font-semibold mt-2">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <ShoppingCart className="h-8 w-8 text-luxury-gold" />
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cart Summary */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-base text-gray-600">Items</span>
                <span>{cartItems.length}</span>
              </div>
              {cartItems.length > 0 && (
                <div className="mb-2 max-h-32 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${item.size}-${index}`} className="flex justify-between text-sm text-gray-700">
                      <div>
                        {item.name} (Size: {item.size}) x{item.quantity}
                      </div>
                      <div>${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span className="text-base text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between mb-2 text-green-700">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span className="text-base text-gray-600">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-base text-gray-600">Tax {`(${(taxRate * 100).toFixed(2)}%)`}</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between mb-4">
                <span className="text-base font-semibold">Total</span>
                <span className="font-bold text-luxury-gold text-lg">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Form */}
            <div className="space-y-2">
              <Input
                placeholder="Full Name"
                value={shipping.fullName}
                onChange={e => setShipping(v => ({ ...v, fullName: e.target.value }))}
                disabled={submitting}
              />
              {errors.fullName && <div className="text-red-600 text-xs">{errors.fullName}</div>}
              
              <Input
                placeholder="Address"
                value={shipping.address}
                onChange={e => setShipping(v => ({ ...v, address: e.target.value }))}
                disabled={submitting}
              />
              {errors.address && <div className="text-red-600 text-xs">{errors.address}</div>}
              
              <Input
                placeholder="City"
                value={shipping.city}
                onChange={e => setShipping(v => ({ ...v, city: e.target.value }))}
                disabled={submitting}
              />
              {errors.city && <div className="text-red-600 text-xs">{errors.city}</div>}
              
              <Input
                placeholder="Postal Code"
                value={shipping.postalCode}
                onChange={e => setShipping(v => ({ ...v, postalCode: e.target.value }))}
                disabled={submitting}
              />
              {errors.postalCode && <div className="text-red-600 text-xs">{errors.postalCode}</div>}
              
              <Input
                placeholder="Country"
                value={shipping.country}
                onChange={e => setShipping(v => ({ ...v, country: e.target.value }))}
                disabled={submitting}
              />
              {errors.country && <div className="text-red-600 text-xs">{errors.country}</div>}
            </div>

            {/* Payment - Placeholder */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800 mb-2">
              Payment processing is simulated. Orders will be saved to your account.
            </div>

            <Button
              type="submit"
              className="w-full bg-luxury-gold text-black font-semibold flex gap-2 items-center"
              size="lg"
              disabled={submitting}
            >
              <CreditCard className="h-5 w-5" />
              {submitting ? "Placing Order..." : "Place Order"}
            </Button>
            <Link to="/cart">
              <Button variant="outline" className="w-full" size="lg" disabled={submitting}>
                Back to Cart
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
