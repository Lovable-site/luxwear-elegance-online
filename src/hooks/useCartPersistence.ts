
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const useCartPersistence = () => {
  const { user } = useAuth();
  const { cartItems, setCartItems } = useCart();

  // Load cart from database when user logs in
  useEffect(() => {
    if (user) {
      loadCartFromDatabase();
    }
  }, [user]);

  // Sync cart to database when cart changes (for logged-in users)
  useEffect(() => {
    if (user && cartItems.length > 0) {
      syncCartToDatabase();
    }
  }, [cartItems, user]);

  const loadCartFromDatabase = async () => {
    if (!user) return;

    try {
      const { data: cartData, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            name,
            price,
            images
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const cartItems = cartData?.map(item => ({
        id: parseInt(item.product_id),
        name: item.products?.name || '',
        price: item.products?.price || 0,
        image: item.products?.images?.[0] || '',
        size: item.size || '',
        color: 'Default', // You can extend this later
        quantity: item.quantity
      })) || [];

      setCartItems(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const syncCartToDatabase = async () => {
    if (!user) return;

    try {
      // Clear existing cart items for this user
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      // Insert current cart items
      if (cartItems.length > 0) {
        const cartData = cartItems.map(item => ({
          user_id: user.id,
          product_id: item.id.toString(),
          quantity: item.quantity,
          size: item.size || null
        }));

        await supabase
          .from('cart_items')
          .insert(cartData);
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  const createOrder = async (shippingData: any) => {
    if (!user || cartItems.length === 0) {
      throw new Error('Invalid order data');
    }

    try {
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discount = subtotal > 500 ? subtotal * 0.1 : 0;
      const shippingCost = subtotal > 200 ? 0 : 25;
      const tax = (subtotal - discount) * 0.08;
      const total = subtotal - discount + shippingCost + tax;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending',
          shipping_address: shippingData,
          billing_address: shippingData // Using same address for billing
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id.toString(),
        quantity: item.quantity,
        price: item.price,
        size: item.size || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart from database
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  return {
    createOrder,
    syncCartToDatabase,
    loadCartFromDatabase
  };
};
