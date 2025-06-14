
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCartPersistence } from "./useCartPersistence";

export const useCartSync = () => {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { syncCartToDatabase } = useCartPersistence();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced sync to database when cart changes
  useEffect(() => {
    if (!user) return;

    // Clear previous timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Set new timeout for debounced sync
    syncTimeoutRef.current = setTimeout(() => {
      syncCartToDatabase();
    }, 1000); // Sync after 1 second of no changes

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cartItems, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);
};
