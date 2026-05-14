import type { PaymentType } from "@prisma/client";
import { formatRupiah } from "~/lib/format";

type InvoiceItem = {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
};

type InvoiceData = {
  receiptNo: string;
  createdAt: Date;
  paymentType: PaymentType | string;
  isPaid: boolean;
  totalAmount: number;
  discount: number;
  tax: number;
  notes: string | null;
  customer?: {
    name: string;
    phone: string | null;
    address: string | null;
  } | null;
  items?: InvoiceItem[];
};

type WarungData = {
  name: string;
  address: string | null;
  phone: string | null;
};

interface InvoiceCardProps {
  invoice: InvoiceData;
  Kasir: WarungData;
}

const paymentLabel: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  BANK_TRANSFER: "Transfer Bank",
  E_WALLET: "E-Wallet",
  DEBT: "Hutang",
};

export const InvoiceCard = ({ invoice, Kasir }: InvoiceCardProps) => {
  const subtotalAfterDiscount = Math.max(0, invoice.totalAmount - (invoice.tax || 0));
  const subtotalBeforeDiscount = subtotalAfterDiscount + (invoice.discount || 0);

  return (
    <div id={`invoice-${invoice.receiptNo}`} className="space-y-4 text-sm">
      <div className="border-b pb-3 text-center">
        <h2 className="text-lg font-bold">{Kasir.name}</h2>
        {Kasir.address && <p className="text-muted-foreground">{Kasir.address}</p>}
        {Kasir.phone && <p className="text-muted-foreground">{Kasir.phone}</p>}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>No. Invoice</span>
          <span className="font-medium">{invoice.receiptNo}</span>
        </div>
        <div className="flex justify-between">
          <span>Tanggal</span>
          <span>{new Date(invoice.createdAt).toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Pelanggan</span>
          <span>{invoice.customer?.name || "Umum"}</span>
        </div>
        <div className="flex justify-between">
          <span>Pembayaran</span>
          <span>{paymentLabel[invoice.paymentType] || invoice.paymentType}</span>
        </div>
        <div className="flex justify-between">
          <span>Status</span>
          <span>{invoice.isPaid ? "Dibayar" : "Belum Dibayar"}</span>
        </div>
      </div>

      <div className="space-y-2 border-y py-3">
        {(invoice.items ?? []).map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-muted-foreground text-xs">
                {item.quantity} x {formatRupiah(item.price)}
              </p>
            </div>
            <p className="font-medium">{formatRupiah(item.quantity * item.price)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatRupiah(subtotalBeforeDiscount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Diskon</span>
          <span>- {formatRupiah(invoice.discount || 0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtotal Setelah Diskon</span>
          <span>{formatRupiah(subtotalAfterDiscount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Pajak</span>
          <span>{formatRupiah(invoice.tax || 0)}</span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatRupiah(invoice.totalAmount)}</span>
        </div>
        {invoice.notes && (
          <div className="text-muted-foreground pt-2 text-xs">
            <span className="font-medium">Catatan:</span> {invoice.notes}
          </div>
        )}
      </div>

      <p className="text-muted-foreground pt-2 text-center text-xs">
        Terima kasih sudah berbelanja
      </p>
    </div>
  );
};

