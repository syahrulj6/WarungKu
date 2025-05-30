import type { SaleItem } from "@prisma/client";
import { Check, ChevronDown, X } from "lucide-react";
import { Card } from "~/components/ui/card";
import { formatRupiah } from "~/lib/format";

interface AlertCardProps {
  receiptNo: string;
  isPaid: boolean;
  openDetail: boolean;
  setOpenDetail: (detail: boolean) => boolean;
  item: SaleItem[];
  createdAt: Date;
  totalAmount: number;
  paymentMethod: string;
}

export const AlertCard = ({
  receiptNo,
  isPaid,
  totalAmount,
  paymentMethod,
  item,
  createdAt,
  setOpenDetail,
}: AlertCardProps) => {
  <Card className="flex w-full items-center justify-between">
    <div className="flex items-center gap-4">
      <div
        className={` ${isPaid ? "bg-green-500" : "bg-red-500"} flex h-20 w-20 items-center justify-center rounded-full`}
      >
        {isPaid ? <Check /> : <X />}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Order {receiptNo}</h2>
        <p className="text-muted-foreground text-sm">
          {isPaid ? "has been paid successfully" : "unpaid"}
        </p>
        <button
          onClick={(prev) => setOpenDetail(!prev)}
          className="text-muted-foreground flex items-center gap-2 hover:text-current"
        >
          See Detail <ChevronDown />
        </button>
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        {createdAt.getTime().toString()} ago
      </p>
      <div className="flex items-center gap-2">
        <p className="font-semibold">{formatRupiah(totalAmount)}</p>
        <div className="bg-muted-foreground p-2 text-sm text-current">
          {paymentMethod}
        </div>
      </div>
    </div>
  </Card>;
};
