import { useEffect, useRef } from "react";
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
  const dbCartLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const lastSyncedCartRef = useRef<string>("");

  // Load cart from database when user logs in (only once)
  useEffect(() => {
    if (user && !dbCartLoadedRef.current && !isLoadingRef.current) {
      console.log('[CartPersistence] Loading cart from database for user:', user.email);
      isLoadingRef.current = true;

      (async () => {
        try {
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
            // DB is empty, but local cart has items: keep local cart & sync to DB
            console.log("[CartPersistence] Local cart present, DB empty. Keeping local cart & syncing to DB.");
            // Store the current cart state to prevent re-syncing
            lastSyncedCartRef.current = JSON.stringify(cartItems);
            await syncCartToDatabase();
          } else if (dbCart.length > 0 && localCart.length === 0) {
            // DB has items, local cart is empty: set to DB cart
            console.log("[CartPersistence] DB has cart, local is empty. Loading DB cart.");
            setCartItems(dbCart);
            lastSyncedCartRef.current = JSON.stringify(dbCart);
          } else if (dbCart.length > 0 && localCart.length > 0) {
            // Both have items: Only merge if we haven't done this before
            const currentCartString = JSON.stringify(localCart);
            const dbCartString = JSON.stringify(dbCart);
            
            // Check if we've already processed this exact combination
            if (lastSyncedCartRef.current !== currentCartString && lastSyncedCartRef.current !== dbCartString) {
              const merged = mergeCarts(localCart, dbCart);
              setCartItems(merged);
              lastSyncedCartRef.current = JSON.stringify(merged);
              console.log("[CartPersistence] Both carts have items. Merging and syncing.");
            } else {
              // Use the more recent cart (prefer local)
              setCartItems(localCart);
              lastSyncedCartRef.current = currentCartString;
              console.log("[CartPersistence] Using local cart, already synced.");
            }
          } else {
            // Both empty
            lastSyncedCartRef.current = "[]";
          }
          
          dbCartLoadedRef.current = true;
        } catch (error) {
          console.error('[CartPersistence] Error in cart loading:', error);
        } finally {
          isLoadingRef.current = false;
        }
      })();
    }
  }, [user]); // Only depend on user, not cartItems

  // Reset loading flag when user logs out
  useEffect(() => {
    if (!user) {
      dbCartLoadedRef.current = false;
      isLoadingRef.current = false;
      lastSyncedCartRef.current = "";
    }
  }, [user]);

  const syncCartToDatabase = async () => {
    if (!user || isLoadingRef.current) return;

    // Prevent syncing if cart hasn't changed
    const currentCartString = JSON.stringify(cartItems);
    if (lastSyncedCartRef.current === currentCartString) {
      console.log('[CartPersistence] Cart unchanged, skipping sync');
      return;
    }

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

      // Update the last synced state
      lastSyncedCartRef.current = currentCartString;
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
        product_id: String(item.id),
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
