import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

function mergeCarts(localCart, dbCart) {
  // Merge by id+size; sum quantities if duplicate
  const mergedItems = [...localCart];
  dbCart.forEach(dbItem => {
    const idx = mergedItems.findIndex(
      i => i.id === dbItem.id && i.size === dbItem.size
    );
    if (idx === -1) {
      mergedItems.push(dbItem);
    } else {
      mergedItems[idx].quantity += dbItem.quantity;
    }
  });
  return mergedItems;
}

export const useCartPersistence = () => {
  const { user } = useAuth();
  const { cartItems, setCartItems } = useCart();

  // Track if cart has been loaded from DB (so we don't overwrite unnecessarily)
  let dbCartLoaded = false;

  // Load cart from database when user logs in
  useEffect(() => {
    if (user) {
      console.log('[CartPersistence] Loading cart from database for user:', user.email);

      (async () => {
        // Fetch cart items from DB
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

        // Compare with local cart
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

        if (dbCart.length === 0 && localCart.length > 0) {
          // DB is empty, but local cart has items: push local cart to state & sync to DB
          console.log("[CartPersistence] Local cart present, DB empty. Keeping local cart & syncing to DB.");
          setCartItems(localCart); // This triggers syncCartToDatabase below
        } else if (dbCart.length > 0 && localCart.length === 0) {
          // DB has items, local cart is empty: set to DB cart
          console.log("[CartPersistence] DB has cart, local is empty. Loading DB cart.");
          setCartItems(dbCart);
        } else if (dbCart.length > 0 && localCart.length > 0) {
          // Both have items: merge and sync
          const merged = mergeCarts(localCart, dbCart);
          setCartItems(merged); // This will trigger syncCartToDatabase below
          console.log("[CartPersistence] Both carts have items. Merging and syncing.");
        } // else, both empty: set empty, nothing to do
        dbCartLoaded = true;
      })();
    }
    // Only run this logic on login
    // eslint-disable-next-line
  }, [user]);

  // Sync cart to database when cart changes (for logged-in users)
  useEffect(() => {
    if (user && cartItems.length >= 0) {
      // Don't sync unless we've loaded DB cart at least once (prevents immediate empty overwrite)
      syncCartToDatabase();
    }
    // eslint-disable-next-line
  }, [cartItems, user]);

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
          product_id: String(item.id),
          quantity: item.quantity,
          size: item.size || null
        }));

        await supabase.from('cart_items').insert(cartData);
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
        product_id: String(item.id), // Ensure it's a string
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
    loadCartFromDatabase: async () => {}, // Unused/legacy
  };
};
