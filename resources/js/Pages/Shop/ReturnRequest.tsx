import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";

import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Order } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

export default function ReturnRequestPage() {
  const { order } = usePage<{ order: Order }>().props;
  const [type, setType] = useState<"refund" | "return" | "exchange">("refund");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({ title: "Reason is required", variant: "destructive" });
      return;
    }

    router.post(`/orders/${order.id}/return-request${window.location.search}`, {
      type,
      reason: reason.trim(),
      details: details.trim() || null,
    }, {
      onSuccess: () => toast({ title: "Return request submitted" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to submit return request", variant: "destructive" });
      },
    });
  };

  return (
    <StorefrontLayout title="Return Request">
      <Head title="Return Request" />

      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Request a Return or Refund</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Submit a return, exchange, or refund request for order {order.invoiceNumber || order.id}.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="exchange">Exchange</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain the main reason for your request." />
            </div>

            <div className="space-y-2">
              <Label>Extra Details</Label>
              <Textarea rows={6} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Share any product issue, wrong item details, damage information, or delivery problem." />
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              Our team will review your request and contact you with the next steps. Please keep your product and packaging available until the review is complete.
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get(order.invoiceUrl || "/")}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit Request</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StorefrontLayout>
  );
}
