import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useOrderStore } from "~/stores/order-store";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { type PaymentType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { toast } from "sonner";
import { InvoiceCard } from "./InvoiceCard";

export const CheckoutForm = () => {
  const router = useRouter();
  const { id } = router.query;
  const { items, clearOrder } = useOrderStore();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>("CASH");
  const [notes, setNotes] = useState<string>("");
  const [discountPercentInput, setDiscountPercentInput] = useState<string>("0");
  const [applyTax, setApplyTax] = useState<boolean>(false);
  const [taxPercentInput, setTaxPercentInput] = useState<string>("11");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [createdSaleId, setCreatedSaleId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const { data: customers, refetch: refetchCustomers } =
    api.customer.getAll.useQuery({
      warungId: id as string,
    });

  const { data: Kasir } = api.kasir.getKasirById.useQuery(
    { warungId: id as string },
    { enabled: !!id },
  );

  const { data: createdSale } = api.sale.getById.useQuery(
    { id: createdSaleId ?? "" },
    { enabled: !!createdSaleId },
  );

  const { mutate: createCustomer, isPending: isCreatingCustomer } =
    api.customer.create.useMutation({
      onSuccess: (customer) => {
        toast.success("Berhasil membuat customer baru");
        setCustomerId(customer.id);
        void refetchCustomers();
        setIsCustomerDialogOpen(false);
        setNewCustomer({ name: "", phone: "", email: "", address: "" });
      },
      onError: () => {
        toast.error("Gagal membuat customer baru");
      },
    });

  const { mutate: createSale } = api.sale.create.useMutation({
    onSuccess: (sale) => {
      toast.success("Berhasil membuat order");
      clearOrder();
      setDiscountPercentInput("0");
      setApplyTax(false);
      setTaxPercentInput("11");
      setCreatedSaleId(sale.id);
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error("Checkout failed:", error);
      toast.error("Gagal membuat order");
      setIsProcessing(false);
    },
  });

  const subTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discountPercent = Math.min(
    100,
    Math.max(0, Number(discountPercentInput) || 0),
  );
  const taxPercent = Math.min(100, Math.max(0, Number(taxPercentInput) || 0));
  const roundMoney = (value: number) => Math.round(value * 100) / 100;
  const discountAmount = roundMoney((subTotal * discountPercent) / 100);
  const netAfterDiscount = Math.max(0, subTotal - discountAmount);
  const taxAmount = applyTax ? roundMoney((netAfterDiscount * taxPercent) / 100) : 0;
  const grandTotal = roundMoney(netAfterDiscount + taxAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    createSale({
      warungId: id as string,
      customerId,
      paymentType,
      totalAmount: grandTotal,
      discountPercent,
      applyTax,
      taxPercent,
      notes: notes || null,
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  };

  const handleCreateCustomer = () => {
    if (!newCustomer.name.trim()) {
      toast.error("Nama Customer harus ada!");
      return;
    }

    createCustomer({
      warungId: id as string,
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      email: newCustomer.email.trim(),
      address: newCustomer.address.trim(),
    });
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-printable,
          .invoice-printable * {
            visibility: visible;
          }
          .invoice-printable {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      `}</style>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label>Pelanggan (Opsional)</Label>
          <div className="flex gap-2">
            <Select
              value={customerId ?? "none"}
              onValueChange={(value) =>
                setCustomerId(value === "none" ? null : value)
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Pilih pelanggan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa pelanggan</SelectItem>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} {customer.phone && `(${customer.phone})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog
              open={isCustomerDialogOpen}
              onOpenChange={setIsCustomerDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Tambah pelanggan baru"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah pelanggan baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nama *</Label>
                    <Input
                      id="customerName"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      placeholder="Nama pelanggan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Telepon</Label>
                    <Input
                      id="customerPhone"
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, phone: e.target.value })
                      }
                      placeholder="Nomor telepon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, email: e.target.value })
                      }
                      placeholder="Alamat email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Alamat</Label>
                    <Input
                      id="customerAddress"
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: e.target.value,
                        })
                      }
                      placeholder="Alamat"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleCreateCustomer}
                    className="w-full"
                    disabled={isCreatingCustomer}
                  >
                    {isCreatingCustomer ? "Menambahkan..." : "Tambah Pelanggan"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="space-y-2">
          <Label>Metode Pembayaran</Label>
          <RadioGroup
            value={paymentType}
            onValueChange={(value) => setPaymentType(value as PaymentType)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CASH" id="cash" />
              <Label htmlFor="cash">Tunai</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="QRIS" id="qris" />
              <Label htmlFor="qris">QRIS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="BANK_TRANSFER" id="transfer" />
              <Label htmlFor="transfer">Transfer Bank</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="E_WALLET" id="ewallet" />
              <Label htmlFor="ewallet">E-Wallet</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Catatan</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan tambahan..."
          />
        </div>

        {/* Tax */}
        <div className="space-y-2">
          <Label htmlFor="discount">Diskon (%)</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={discountPercentInput}
            onChange={(e) => setDiscountPercentInput(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium">Terapkan PPN</p>
              <p className="text-muted-foreground text-xs">
                Perhitungan: PPN = tarif x DPP (setelah diskon)
              </p>
            </div>
            <Input
              type="checkbox"
              checked={applyTax}
              onChange={(e) => setApplyTax(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
          {applyTax && (
            <div className="space-y-2">
              <Label htmlFor="tax">Tarif PPN (%)</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxPercentInput}
                onChange={(e) => setTaxPercentInput(e.target.value)}
                placeholder="11"
              />
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="rounded-lg border p-4">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rp{subTotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Diskon:</span>
              <span>
                - Rp{discountAmount.toLocaleString("id-ID")} ({discountPercent.toLocaleString("id-ID")}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>DPP (Setelah Diskon):</span>
              <span>Rp{netAfterDiscount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>PPN{applyTax ? ` (${taxPercent.toLocaleString("id-ID")}%)` : ""}:</span>
              <span>Rp{taxAmount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Total:</span>
              <span>Rp{grandTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isProcessing || items.length === 0}
        >
          {isProcessing ? "Memproses..." : "Selesaikan Pesanan"}
        </Button>
      </form>

      <Dialog
        open={!!createdSaleId}
        onOpenChange={(open) => !open && setCreatedSaleId(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoice Pesanan</DialogTitle>
          </DialogHeader>
          {createdSale && Kasir ? (
            <div className="space-y-4">
              <div className="invoice-printable rounded-lg border p-4">
                <InvoiceCard invoice={createdSale} Kasir={Kasir} />
              </div>
              <div className="flex gap-2">
                <Button type="button" className="w-full" onClick={handlePrintInvoice}>
                  Cetak Invoice
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    void router.push(`/dashboard/kasir/${id as string}/history`)
                  }
                >
                  Ke Riwayat
                </Button>
              </div>
            </div>
          ) : (
            <p>Memuat data invoice...</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};



