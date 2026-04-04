export function hasActiveSalePrice(price: number, salePrice?: number | null): salePrice is number {
  return salePrice !== null && salePrice !== undefined && salePrice < price;
}

export function resolveEffectivePrice(price: number, salePrice?: number | null): number {
  return hasActiveSalePrice(price, salePrice) ? salePrice : price;
}
