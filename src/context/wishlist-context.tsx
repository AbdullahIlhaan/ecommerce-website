import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { toast } from "@/hooks/use-toast";

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  stock: number;
};

type WishlistContextType = {
  items: WishlistItem[];
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (id: string, options?: { silent?: boolean }) => void;
  toggleWishlist: (product: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  itemCount: number;
  isLoaded: boolean;
};

const WISHLIST_STORAGE_KEY = "fb_wishlist";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);

    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error("Failed to parse wishlist", error);
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [isLoaded, items]);

  const addToWishlist = (product: WishlistItem) => {
    setItems((previousItems) => {
      if (previousItems.some((item) => item.id === product.id)) {
        return previousItems;
      }

      toast({
        title: "Added to wishlist",
        description: `${product.name} was added to your wishlist.`,
      });

      return [...previousItems, product];
    });
  };

  const removeFromWishlist = (id: string, options?: { silent?: boolean }) => {
    setItems((previousItems) => {
      const item = previousItems.find((entry) => entry.id === id);

      if (item && !options?.silent) {
        toast({
          title: "Removed from wishlist",
          description: `${item.name} was removed from your wishlist.`,
        });
      }

      return previousItems.filter((entry) => entry.id !== id);
    });
  };

  const toggleWishlist = (product: WishlistItem) => {
    setItems((previousItems) => {
      const exists = previousItems.some((item) => item.id === product.id);

      if (exists) {
        toast({
          title: "Removed from wishlist",
          description: `${product.name} was removed from your wishlist.`,
        });

        return previousItems.filter((item) => item.id !== product.id);
      }

      toast({
        title: "Added to wishlist",
        description: `${product.name} was added to your wishlist.`,
      });

      return [...previousItems, product];
    });
  };

  const value = useMemo<WishlistContextType>(() => ({
    items,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist: (id: string) => items.some((item) => item.id === id),
    itemCount: items.length,
    isLoaded,
  }), [isLoaded, items]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);

  if (context === undefined) {
    throw new Error("useWishlistContext must be used within a WishlistProvider");
  }

  return context;
}
