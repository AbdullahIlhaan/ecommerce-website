import type { ReactNode } from "react";
import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { Order, ReturnRequest } from "@/lib/store";

function ReturnRequestEditPage() {
  const { returnRequest, order } = usePage<{ returnRequest: ReturnRequest; order: Order }>().props;
  const [status, setStatus] = useState(returnRequest.status);
  const [refundAmount, setRefundAmount] = useState(returnRequest.refundAmount?.toString() ?? order.total.toFixed(2));
  const [resolutionNotes, setResolutionNotes] = useState(returnRequest.resolutionNotes ?? "");
  const [restockItems, setRestockItems] = useState(returnRequest.restockItems);

  const handleSubmit = () => {
    router.put(`/return-requests/${returnRequest.id}`, {
      status,
      refundAmount: refundAmount.trim() ? Number(refundAmount) : null,
      resolutionNotes: resolutionNotes.trim() || null,
      restockItems,
    }, {
      onSuccess: () => toast({ title: "Return request updated" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to update return request", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={`Review ${returnRequest.orderReference || returnRequest.id}`} />

      <div className="animate-fade-in">
        <PageHeader title={returnRequest.orderReference || returnRequest.id} description="Approve, reject, receive, restock, and refund customer return requests from one screen.">
          <Button variant="outline" onClick={() => router.get("/return-requests")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Returns
          </Button>
        </PageHeader>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.9fr)]">
          <Card>
            <CardContent className="space-y-5 p-4 sm:p-6">
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{returnRequest.customerName || "Customer"}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{returnRequest.customerEmail || "-"}</span></div>
                <div><span className="text-muted-foreground">Request Type:</span> <span className="font-medium capitalize">{returnRequest.type}</span></div>
                <div><span className="text-muted-foreground">Requested:</span> <span className="font-medium">{returnRequest.requestedAt || returnRequest.createdAt || "-"}</span></div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Reason</div>
                <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm">{returnRequest.reason}</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Customer Details</div>
                <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm whitespace-pre-line">
                  {returnRequest.details || "No extra details were submitted."}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Order Items</div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-muted-foreground">Qty {item.quantity}</div>
                      </div>
                      <div className="font-semibold">BDT {item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6 p-4 sm:p-6">
              <div className="space-y-2">
                <Label>Request Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as ReturnRequest["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["pending", "approved", "rejected", "received", "refunded", "closed"].map((item) => (
                      <SelectItem key={item} value={item} className="capitalize">{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Refund Amount</Label>
                <Input value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} />
              </div>

              <div className="flex items-center space-x-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
                <Checkbox id="restock" checked={restockItems} onCheckedChange={(checked) => setRestockItems(Boolean(checked))} />
                <Label htmlFor="restock" className="leading-6">Restock returned items back into inventory when this request is completed.</Label>
              </div>

              <div className="space-y-2">
                <Label>Resolution Notes</Label>
                <Textarea rows={5} value={resolutionNotes} onChange={(event) => setResolutionNotes(event.target.value)} placeholder="Add internal notes about inspection, approval, pickup, or refund handling." />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-6">
                <Button variant="outline" onClick={() => router.get("/return-requests")}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Return Request</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

ReturnRequestEditPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default ReturnRequestEditPage;
