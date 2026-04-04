import { useWishlistContext } from "@/context/wishlist-context";

export function useWishlist() {
  return useWishlistContext();
}

export type { WishlistItem } from "@/context/wishlist-context";
