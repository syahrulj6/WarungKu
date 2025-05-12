import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Check, X } from "lucide-react";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";

export interface Order {
  id: string;
  receiptNo: string;
  createdAt: Date;
  customer: { name: string } | null;
  totalAmount: number;
  paymentType: string;
  isPaid: boolean;
}

interface OrderListProps {
  orders?: Order[];
  isLoading: boolean;
}

export const OrderList = ({ orders, isLoading }: OrderListProps) => {
  const utils = api.useUtils();
  const { mutate: markAsPaid } = api.sale.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Order marked as paid");
      void utils.sale.getByStatus.invalidate();
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "receiptNo",
      header: "Receipt No",
      cell: ({ row }) => row.original.receiptNo,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => row.original.customer?.name || "Walk-in Customer",
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) =>
        `Rp${row.original.totalAmount.toLocaleString("id-ID")}`,
    },
    {
      accessorKey: "paymentType",
      header: "Payment",
      cell: ({ row }) => row.original.paymentType,
    },
    {
      accessorKey: "isPaid",
      header: "Status",
      cell: ({ row }) =>
        row.original.isPaid ? (
          <span className="flex items-center text-green-600">
            <Check className="mr-1 h-4 w-4" /> Paid
          </span>
        ) : (
          <span className="flex items-center text-yellow-600">
            <X className="mr-1 h-4 w-4" /> Unpaid
          </span>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) =>
        !row.original.isPaid && (
          <Button size="sm" onClick={() => markAsPaid({ id: row.original.id })}>
            Mark as Paid
          </Button>
        ),
    },
  ];

  const table = useReactTable({
    data: orders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
