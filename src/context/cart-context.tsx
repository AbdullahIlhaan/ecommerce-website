import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { resolveEffectivePrice } from '@/lib/pricing';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  quantity: number;
  stock: number;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  syncCart: (products: Array<Omit<CartItem, 'quantity'>>) => void;
  subtotal: number;
  itemCount: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('fb_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fb_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast({ title: "Updated quantity", description: `${product.name} quantity updated in cart.` });
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      toast({ title: "Added to cart", description: `${product.name} added to your cart.` });
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => {
      const item = prev.find(i => i.id === id);
      if (item) toast({ title: "Removed from cart", description: `${item.name} removed.` });
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const syncCart = useCallback((products: Array<Omit<CartItem, 'quantity'>>) => {
    setItems((prev) => {
      const productsById = new Map(products.map((product) => [product.id, product]));
      let changed = false;

      const nextItems = prev.flatMap((item) => {
        const latest = productsById.get(item.id);

        if (!latest || latest.stock <= 0) {
          changed = true;
          return [];
        }

        const quantity = Math.min(item.quantity, latest.stock);
        const nextItem: CartItem = {
          ...latest,
          quantity,
        };

        if (
          item.name !== nextItem.name
          || item.price !== nextItem.price
          || item.salePrice !== nextItem.salePrice
          || item.image !== nextItem.image
          || item.stock !== nextItem.stock
          || item.quantity !== nextItem.quantity
        ) {
          changed = true;
        }

        return [nextItem];
      });

      if (changed) {
        toast({
          title: "Cart updated",
          description: "We refreshed your cart with the latest product prices and stock.",
        });
      }

      return changed ? nextItems : prev;
    });
  }, []);

  const subtotal = items.reduce(
    (acc, item) => acc + resolveEffectivePrice(item.price, item.salePrice) * item.quantity,
    0
  );

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      syncCart,
      subtotal,
      itemCount,
      isLoaded
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
