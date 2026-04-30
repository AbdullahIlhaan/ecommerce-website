import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { RotateCcw, Search } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReturnRequest } from "@/lib/store";

function ReturnRequestsPage() {
  const { returnRequests } = usePage<{ returnRequests: ReturnRequest[] }>().props;
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return returnRequests.filter((request) => (
      normalizedSearch.length === 0
      || (request.orderReference || "").toLowerCase().includes(normalizedSearch)
      || (request.customerName || "").toLowerCase().includes(normalizedSearch)
      || request.reason.toLowerCase().includes(normalizedSearch)
      || request.type.toLowerCase().includes(normalizedSearch)
    ));
  }, [returnRequests, search]);

  return (
    <>
      <Head title="Returns" />

      <div className="animate-fade-in">
        <PageHeader title="Returns & Refunds" description="Review customer return, exchange, and refund requests and complete the resolution workflow." />

        <Card>
          <CardContent className="p-4">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order, customer, type, or reason..."
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="No return requests"
                description="Customer return or refund submissions will appear here."
                icon={<RotateCcw className="h-8 w-8 text-muted-foreground" />}
              />
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {filtered.map((request) => (
                    <article key={request.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">{request.orderReference || request.orderId}</div>
                            <div className="text-sm text-muted-foreground">{request.customerName || "Customer"}</div>
                          </div>
                          <StatusBadge status={request.status} />
                        </div>
                        <div className="text-sm capitalize text-muted-foreground">{request.type}</div>
                        <div className="text-sm">{request.reason}</div>
                        <div className="text-xs text-muted-foreground">{request.requestedAt || request.createdAt || "-"}</div>
                        <Button variant="outline" size="sm" onClick={() => router.get(`/return-requests/${request.id}/edit`)}>
                          Review Request
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.orderReference || request.orderId}</TableCell>
                          <TableCell>{request.customerName || "Customer"}</TableCell>
                          <TableCell className="capitalize">{request.type}</TableCell>
                          <TableCell className="max-w-[22rem] whitespace-normal">{request.reason}</TableCell>
                          <TableCell><StatusBadge status={request.status} /></TableCell>
                          <TableCell>{request.requestedAt || request.createdAt || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => router.get(`/return-requests/${request.id}/edit`)}>
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

ReturnRequestsPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default ReturnRequestsPage;
