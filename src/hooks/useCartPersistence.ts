import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const useCartPersistence = () => {
  const { user } = useAuth();
  const { cartItems, setCartItems } = useCart();
  const hasLoadedFromDB = useRef(false);
  const isInitializing = useRef(false);

  // Load cart from database only once when user logs in
  useEffect(() => {
    if (!user || hasLoadedFromDB.current || isInitializing.current) return;
    
    console.log('[CartPersistence] Loading cart for user:', user.email);
    isInitializing.current = true;
    
    loadCartFromDatabase();
  }, [user]);

  // Reset flags when user logs out
  useEffect(() => {
    if (!user) {
      hasLoadedFromDB.current = false;
      isInitializing.current = false;
    }
  }, [user]);

  const loadCartFromDatabase = async () => {
    if (!user) return;

    try {
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
        toast.error('Failed to load cart from database');
        return;
      }

      const dbCart = cartData?.map(item => ({
        id: String(item.product_id),
        name: item.products?.name || 'Unknown Product',
        price: Number(item.products?.price) || 0,
        image: item.products?.images?.[0] || '/placeholder.svg',
        size: item.size || 'M',
        color: 'Default',
        quantity: item.quantity
      })) || [];

      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

      // Simple logic: if DB has cart, use it; otherwise keep local cart
      if (dbCart.length > 0) {
        console.log('[CartPersistence] Using database cart');
        setCartItems(dbCart);
      } else if (localCart.length > 0) {
        console.log('[CartPersistence] Using local cart and syncing to DB');
        await syncCartToDatabase(localCart);
      }

      hasLoadedFromDB.current = true;
    } catch (error) {
      console.error('[CartPersistence] Error in loadCartFromDatabase:', error);
    } finally {
      isInitializing.current = false;
    }
  };

  const syncCartToDatabase = async (itemsToSync = cartItems) => {
    if (!user || isInitializing.current) return;

    try {
      // Clear existing cart items for this user
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      // Insert current cart items
      if (itemsToSync.length > 0) {
        const cartData = itemsToSync.map(item => ({
          user_id: user.id,
          product_id: String(item.id),
          quantity: item.quantity,
          size: item.size || null
        }));

        await supabase.from('cart_items').insert(cartData);
      }

      console.log('[CartPersistence] Cart synced successfully');
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

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: String(item.id),
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
      console.error('[CartPersistence] Error creating order:', error);
      throw error;
    }
  };

  return {
    createOrder,
    syncCartToDatabase,
  };
};
