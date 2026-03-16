import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center">
      <div className="mb-4 rounded-2xl bg-muted p-4">
        {icon || <PackageOpen className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground md:text-base">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="w-full sm:w-auto">{actionLabel}</Button>
      )}
    </div>
  );
}
