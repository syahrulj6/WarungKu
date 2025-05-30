import type { Sale } from "@prisma/client";
import { Check, ChevronDown, X } from "lucide-react";
import { Card } from "~/components/ui/card";
import { formatRupiah } from "~/lib/format";
import { useState } from "react";

interface AlertCardProps {
  receiptNo: string;
  isPaid: boolean;
  items: {
    product: {
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }[];
  createdAt: Date;
  totalAmount: number;
  paymentMethod: string;
}

export const AlertCard = ({
  receiptNo,
  isPaid,
  totalAmount,
  paymentMethod,
  items,
  createdAt,
}: AlertCardProps) => {
  const [openDetail, setOpenDetail] = useState(false);

  return (
    <Card className="flex w-full flex-row items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div
          className={`${isPaid ? "bg-green-500" : "bg-red-500"} flex h-20 w-20 items-center justify-center rounded-full`}
        >
          {isPaid ? (
            <Check className="text-white" />
          ) : (
            <X className="text-white" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold">Order {receiptNo}</h2>
          <p className="text-muted-foreground text-sm">
            {isPaid ? "has been paid successfully" : "unpaid"}
          </p>
          <button
            onClick={() => setOpenDetail(!openDetail)}
            className="text-muted-foreground flex items-center gap-2 hover:text-current"
          >
            See Detail{" "}
            <ChevronDown className={openDetail ? "rotate-180" : ""} />
          </button>

          {openDetail && (
            <div className="mx-10 mt-4 flex flex-col gap-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between border-b pb-2">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-semibold">{item.product.name}</h4>
                    <div className="flex gap-4 text-sm">
                      <p>
                        {item.quantity} x {formatRupiah(item.product.price)}
                      </p>
                      <p>Total: {formatRupiah(item.quantity * item.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-2 flex justify-between font-bold">
                <p>Total Amount:</p>
                <p>{formatRupiah(totalAmount)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">
          {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}
        </p>
        <div className="flex items-center gap-2">
          <p className="font-semibold">{formatRupiah(totalAmount)}</p>
          <div className="bg-muted-foreground/10 rounded p-2 text-sm">
            {paymentMethod}
          </div>
        </div>
      </div>
    </Card>
  );
};
