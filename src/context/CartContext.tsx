
import React, { createContext, useContext, useState, useEffect } from "react";

type CartItem = {
  id: string; // Changed to always be string for consistency
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  clearCart: () => void;
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  removeFromCart: (id: string, size: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[CartContext] Error loading cart from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
      console.log('[CartContext] Cart saved to localStorage:', cartItems.length, 'items');
    } catch (error) {
      console.error('[CartContext] Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  const clearCart = () => {
    console.log('[CartContext] Clearing cart');
    setCartItems([]);
  };

  const addToCart = (item: CartItem) => {
    console.log('[CartContext] Adding item to cart:', item);
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === item.id && cartItem.size === item.size
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        console.log('[CartContext] Updated existing item quantity:', updatedItems[existingItemIndex]);
        return updatedItems;
      } else {
        console.log('[CartContext] Added new item to cart');
        return [...prevItems, item];
      }
    });
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    console.log('[CartContext] Updating quantity for item:', id, size, quantity);
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.size === size 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const removeFromCart = (id: string, size: string) => {
    console.log('[CartContext] Removing item from cart:', id, size);
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.id === id && item.size === size))
    );
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      setCartItems, 
      clearCart, 
      addToCart, 
      updateQuantity, 
      removeFromCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
