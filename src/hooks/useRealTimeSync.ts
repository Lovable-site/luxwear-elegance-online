
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useRealTimeSync = () => {
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('[RealTimeSync] Setting up real-time subscriptions for user:', user.email);

    // Subscribe to product changes (affects inventory, pricing)
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('[RealTimeSync] Product change detected:', payload);
          
          if (payload.eventType === 'UPDATE') {
            // Notify about stock or price changes
            if (userRole === 'customer') {
              toast.info('Product information updated');
            }
          }
        }
      )
      .subscribe();

    // Subscribe to order status changes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: userRole === 'admin' ? undefined : `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[RealTimeSync] Order status change:', payload);
          
          if (userRole === 'customer') {
            toast.success('Order status updated');
          } else if (userRole === 'admin') {
            toast.info('New order activity');
          }
        }
      )
      .subscribe();

    // Admin-specific subscriptions
    let adminChannels: any[] = [];
    if (userRole === 'admin') {
      // Subscribe to new orders
      const newOrdersChannel = supabase
        .channel('new-orders')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            console.log('[RealTimeSync] New order created:', payload);
            toast.success('New order received!');
          }
        )
        .subscribe();

      // Subscribe to new user registrations
      const newUsersChannel = supabase
        .channel('new-users')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            console.log('[RealTimeSync] New user registered:', payload);
            toast.info('New user registered');
          }
        )
        .subscribe();

      adminChannels = [newOrdersChannel, newUsersChannel];
    }

    // Cleanup function
    return () => {
      console.log('[RealTimeSync] Cleaning up subscriptions');
      productsChannel.unsubscribe();
      ordersChannel.unsubscribe();
      adminChannels.forEach(channel => channel.unsubscribe());
    };
  }, [user, userRole]);
};
