import { useCartContext } from '@/context/cart-context';

export function useCart() {
  return useCartContext();
}

export type { CartItem } from '@/context/cart-context';
