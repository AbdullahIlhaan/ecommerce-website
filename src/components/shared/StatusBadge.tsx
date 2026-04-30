import { cn } from "@/lib/utils";

type StatusType = string;

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success",
  delivered: "bg-success/10 text-success",
  approved: "bg-success/10 text-success",
  paid: "bg-success/10 text-success",
  processing: "bg-info/10 text-info",
  shipped: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  received: "bg-info/10 text-info",
  draft: "bg-muted text-muted-foreground",
  disabled: "bg-muted text-muted-foreground",
  inactive: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
  closed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
  blocked: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-warning/10 text-warning",
};

export function StatusBadge({ status }: { status: StatusType }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
      statusStyles[status] || "bg-muted text-muted-foreground"
    )}>
      {status}
    </span>
  );
}
