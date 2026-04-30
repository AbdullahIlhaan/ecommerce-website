import { Head, Link, usePage } from "@inertiajs/react";
import { Printer, Download, ShoppingBag, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatPaymentMethod } from "@/lib/payments";

type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  invoiceNumber?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  } | null;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  deliveryZone: string | null;
  deliveryCity: string | null;
  deliveryAddress: string | null;
  deliveryLocationLabel: string | null;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  returnRequestUrl?: string | null;
  hasOpenReturnRequest?: boolean;
  formattedDate: string;
};

type FooterSetting = {
  logoPath?: string | null;
  logoText?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

export default function Invoice({ order }: { order: Order }) {
  const { footerSetting } = usePage<{ footerSetting?: FooterSetting }>().props;
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceNumber = order.invoiceNumber ?? `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const orderReference = `#${order.id.slice(0, 8).toUpperCase()}`;
  const companyName = footerSetting?.logoText || "FutureBD";
  const companyDescription =
    footerSetting?.description || "Premium e-commerce platform for global brands and local convenience.";
  const deliveryZoneLabel =
    order.deliveryZone === "inside_dhaka"
      ? "Inside Dhaka"
      : order.deliveryZone === "outside_dhaka"
        ? "Outside Dhaka"
        : order.deliveryZone;
  const deliveryMeta = [order.deliveryCity, deliveryZoneLabel].filter(Boolean).join(" · ");
  const hasDeliveryDetails = Boolean(
    order.deliveryLocationLabel || order.deliveryAddress || order.deliveryCity || order.deliveryZone,
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      setIsDownloading(true);
      const element = invoiceRef.current;
      
      // Temporary hide elements for clean capture
      const actionButtons = document.querySelector('.print-hidden');
      if (actionButtons) (actionButtons as HTMLElement).style.display = 'none';

      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoiceNumber}.pdf`);
      
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-10 print:bg-white print:py-0">
      <Head title={`Invoice ${invoiceNumber}`} />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Actions - Hidden on print */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden print-hidden">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
              Home
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">Order Invoice</h1>
          </div>
          <div className="flex items-center gap-3">
            {order.returnRequestUrl && !order.hasOpenReturnRequest && (
              <Link href={order.returnRequestUrl}>
                <Button variant="outline" className="gap-2">
                  Request Return
                </Button>
              </Link>
            )}
            <Button variant="outline" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print Invoice
            </Button>
            <Button 
              className="gap-2" 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>

        {/* Invoice Card */}
        <div ref={invoiceRef} className="overflow-hidden rounded-3xl border border-border bg-white shadow-2xl shadow-gray-200/50 print:rounded-none print:border-none print:shadow-none">
          {/* Header */}
          <div className="bg-primary px-8 py-10 text-white sm:px-12">
            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                    <img src={footerSetting?.logoPath || "/images/logofbd.jpeg"} alt={companyName} className="h-12 w-12 rounded-xl border-2 border-white/20 object-cover" />
                    <span className="text-3xl font-black tracking-tighter">{companyName}</span>
                </div>
                <p className="text-primary-foreground/80 max-w-xs text-sm">
                  {companyDescription}
                </p>
              </div>
              <div className="text-right sm:text-right">
                <h2 className="text-4xl font-black uppercase tracking-tight">Invoice</h2>
                <div className="mt-2 space-y-1 text-primary-foreground/90 font-bold">
                  <div className="text-sm uppercase tracking-[0.2em] text-primary-foreground/70">Invoice ID</div>
                  <div>{invoiceNumber}</div>
                  <div className="text-sm opacity-80">Order Ref {orderReference}</div>
                  <div className="text-sm opacity-80">{order.formattedDate}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            {/* Info Grid */}
            <div className="grid gap-12 sm:grid-cols-2 mb-12">
              <div>
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Billed To</h3>
                <div className="space-y-1">
                  <div className="text-xl font-black text-foreground">{order.customer?.name}</div>
                  <div className="text-muted-foreground font-medium">{order.customer?.email}</div>
                  <div className="text-muted-foreground font-medium">{order.customer?.phone}</div>
                </div>
                {hasDeliveryDetails && (
                  <div className="mt-5 space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Delivery Address</h3>
                    <div className="font-semibold text-foreground">
                      {order.deliveryLocationLabel || order.deliveryAddress || "Delivery address captured during checkout"}
                    </div>
                    {order.deliveryAddress && order.deliveryLocationLabel !== order.deliveryAddress && (
                      <div className="text-muted-foreground font-medium">{order.deliveryAddress}</div>
                    )}
                    {deliveryMeta && <div className="text-muted-foreground font-medium">{deliveryMeta}</div>}
                    {!deliveryMeta && (
                      <div className="text-muted-foreground font-medium">
                      {order.deliveryCity} · {order.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-8 sm:text-right">
                <div>
                  <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Company Address</h3>
                  <div className="space-y-1 sm:ml-auto sm:max-w-sm">
                    <div className="text-xl font-black text-foreground">{companyName}</div>
                    {footerSetting?.address ? (
                      <div className="whitespace-pre-line text-muted-foreground font-medium">{footerSetting.address}</div>
                    ) : (
                      <div className="text-muted-foreground font-medium">Company address is not set yet in Footer Settings.</div>
                    )}
                    {footerSetting?.phone && <div className="text-muted-foreground font-medium">{footerSetting.phone}</div>}
                    {footerSetting?.email && <div className="text-muted-foreground font-medium">{footerSetting.email}</div>}
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Order Info</h3>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Invoice ID: <span className="font-black text-foreground">{invoiceNumber}</span>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Order Ref: <span className="font-black text-foreground">{orderReference}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                       <span className="text-muted-foreground text-sm">Status:</span>
                       <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="capitalize">{order.status}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                       <span className="text-muted-foreground text-sm">Payment:</span>
                       <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          <span className="capitalize">{order.paymentStatus}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                       <span className="text-muted-foreground text-sm">Method:</span>
                       <div className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-foreground">
                          <span>{formatPaymentMethod(order.paymentMethod)}</span>
                       </div>
                    </div>
                    {(order.shippingCarrier || order.trackingNumber) && (
                      <div className="space-y-1">
                        {order.shippingCarrier && (
                          <div className="text-sm font-medium text-muted-foreground">
                            Carrier: <span className="font-black text-foreground">{order.shippingCarrier}</span>
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div className="text-sm font-medium text-muted-foreground">
                            Tracking: <span className="font-black text-foreground">{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.estimatedDeliveryAt && (
                          <div className="text-sm font-medium text-muted-foreground">
                            ETA: <span className="font-black text-foreground">{order.estimatedDeliveryAt}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mb-12 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Item Description</th>
                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Qty</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Unit Price</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-6 py-5">
                        <div className="font-bold text-foreground">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">SKU-{order.id.slice(0,4)}-{i+1}</div>
                      </td>
                      <td className="px-6 py-5 text-center font-medium">{item.quantity}</td>
                      <td className="px-6 py-5 text-right font-medium">BDT {item.price.toLocaleString()}</td>
                      <td className="px-6 py-5 text-right font-black">BDT {(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="flex flex-col items-end gap-3 border-t border-border pt-8">
              <div className="flex w-full max-w-[280px] justify-between text-sm">
                <span className="font-medium text-muted-foreground">Subtotal</span>
                <span className="font-bold text-foreground">BDT {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex w-full max-w-[280px] justify-between text-sm">
                <span className="font-medium text-muted-foreground">Delivery Charge</span>
                <span className="font-bold text-foreground">BDT {order.deliveryCharge.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex w-full max-w-[280px] justify-between border-t border-border pt-4 text-xl">
                <span className="font-black text-foreground">Order Total</span>
                <span className="font-black text-primary underline underline-offset-4">BDT {order.total.toLocaleString()}</span>
              </div>
              {order.paymentStatus === "pending" && (
                <div className="w-full max-w-[280px] text-right text-xs text-muted-foreground">
                  Payment is still pending confirmation.
                </div>
              )}
            </div>

            <div className="mt-20 text-center border-t border-dashed border-border pt-8">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Thank you for shopping with {companyName}!</p>
                <p className="mt-2 text-[10px] text-muted-foreground italic">This is a system generated invoice and does not require a signature.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
