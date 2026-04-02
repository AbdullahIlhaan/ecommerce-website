export const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  online: "Online Payment",
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHOD_LABELS;

export function formatPaymentMethod(method: string | null | undefined): string {
  if (!method) {
    return PAYMENT_METHOD_LABELS.cod;
  }

  return PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method;
}
