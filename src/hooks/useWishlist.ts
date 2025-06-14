
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Returns: [wishlistProductIds, addToWishlist, removeFromWishlist, isLoading]
export function useWishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist on mount or when user changes
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setWishlist(data ? data.map((row) => row.product_id) : []);
        setLoading(false);
      });
  }, [user]);

  const addToWishlist = useCallback(
    async (productId: string) => {
      if (!user) return;
      // Optimistic UI
      setWishlist(wl => wl.includes(productId) ? wl : [...wl, productId]);
      const { error } = await supabase
        .from("wishlist")
        .insert({ user_id: user.id, product_id: productId });
      if (error) {
        toast.error("Failed to add to wishlist.");
        // revert
        setWishlist(wl => wl.filter((id) => id !== productId));
      } else {
        toast.success("Added to wishlist!");
      }
    },
    [user]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!user) return;
      // Optimistic UI
      setWishlist(wl => wl.filter((id) => id !== productId));
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      if (error) {
        toast.error("Failed to remove from wishlist.");
        // revert
        setWishlist(wl => [...wl, productId]);
      } else {
        toast.success("Removed from wishlist!");
      }
    },
    [user]
  );

  return { 
    wishlist, 
    addToWishlist, 
    removeFromWishlist, 
    isLoading: loading 
  };
}
