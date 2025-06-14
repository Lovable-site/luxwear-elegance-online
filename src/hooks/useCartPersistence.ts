
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
      console.log('[CartPersistence] Loading cart from database for user:', user.email);
      loadCartFromDatabase();
    }
  }, [user]);

  // Sync cart to database when cart changes (for logged-in users)
  useEffect(() => {
    if (user && cartItems.length >= 0) { // Changed condition to sync even empty carts
      console.log('[CartPersistence] Syncing cart to database, items:', cartItems.length);
      syncCartToDatabase();
    }
  }, [cartItems, user]);

  const loadCartFromDatabase = async () => {
    if (!user) return;

    try {
      console.log('[CartPersistence] Fetching cart items from database');
      const { data: cartData, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            images
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('[CartPersistence] Error loading cart:', error);
        throw error;
      }

      console.log('[CartPersistence] Raw cart data from database:', cartData);

      const cartItems = cartData?.map(item => ({
        id: item.product_id, // Keep as string UUID
        name: item.products?.name || 'Unknown Product',
        price: Number(item.products?.price) || 0,
        image: item.products?.images?.[0] || '/placeholder.svg',
        size: item.size || 'M',
        color: 'Default',
        quantity: item.quantity
      })) || [];

      console.log('[CartPersistence] Processed cart items:', cartItems);
      setCartItems(cartItems);
    } catch (error) {
      console.error('[CartPersistence] Error loading cart:', error);
      toast.error('Failed to load cart from database');
    }
  };

  const syncCartToDatabase = async () => {
    if (!user) return;

    try {
      console.log('[CartPersistence] Syncing cart to database');
      
      // Clear existing cart items for this user
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('[CartPersistence] Error clearing cart:', deleteError);
        throw deleteError;
      }

      // Insert current cart items
      if (cartItems.length > 0) {
        const cartData = cartItems.map(item => ({
          user_id: user.id,
          product_id: item.id, // This should be a UUID string
          quantity: item.quantity,
          size: item.size || null
        }));

        console.log('[CartPersistence] Inserting cart data:', cartData);

        const { error: insertError } = await supabase
          .from('cart_items')
          .insert(cartData);

        if (insertError) {
          console.error('[CartPersistence] Error inserting cart items:', insertError);
          throw insertError;
        }
      }

      console.log('[CartPersistence] Cart sync completed successfully');
    } catch (error) {
      console.error('[CartPersistence] Error syncing cart:', error);
      toast.error('Failed to sync cart to database');
    }
  };

  const createOrder = async (shippingData: any) => {
    if (!user || cartItems.length === 0) {
      throw new Error('Invalid order data');
    }

    try {
      console.log('[CartPersistence] Creating order with items:', cartItems);
      
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
          billing_address: shippingData
        })
        .select()
        .single();

      if (orderError) {
        console.error('[CartPersistence] Error creating order:', orderError);
        throw orderError;
      }

      console.log('[CartPersistence] Order created:', order);

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id, // UUID string
        quantity: item.quantity,
        price: item.price,
        size: item.size || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('[CartPersistence] Error creating order items:', itemsError);
        throw itemsError;
      }

      // Clear cart from database
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      console.log('[CartPersistence] Order creation completed successfully');
      return order;
    } catch (error) {
      console.error('[CartPersistence] Error creating order:', error);
      throw error;
    }
  };

  return {
    createOrder,
    syncCartToDatabase,
    loadCartFromDatabase
  };
};
