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

export const CheckoutForm = () => {
  const router = useRouter();
  const { id } = router.query;
  const { items, clearOrder } = useOrderStore();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>("CASH");
  const [notes, setNotes] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
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
    onSuccess: () => {
      toast.success("Berhasil membuat order");
      clearOrder();
      void router.push(`/dashboard/warung/${id as string}/history`);
    },
    onError: (error) => {
      console.error("Checkout failed:", error);
      toast.error("Gagal membuat order");
      setIsProcessing(false);
    },
  });

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    createSale({
      warungId: id as string,
      customerId,
      paymentType,
      totalAmount: total,
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

  return (
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

      {/* Order Summary */}
      <div className="rounded-lg border p-4">
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>Rp{total.toLocaleString("id-ID")}</span>
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
  );
};

