import type { ReactNode } from "react";

import { toast as sonnerToast } from "@/components/ui/sonner";

type ToastInput = {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive";
};

function toast({ title, description, variant = "default" }: ToastInput) {
  return sonnerToast(title ?? "Notice", {
    description,
    className: variant === "destructive" ? "!border-destructive/30 !bg-destructive !text-destructive-foreground" : undefined,
  });
}

function useToast() {
  return {
    toasts: [],
    toast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  };
}

export { useToast, toast };
