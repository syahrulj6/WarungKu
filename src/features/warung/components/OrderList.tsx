import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import PaymentMethodBadge from "./PaymentMethodBadge";

interface Order {
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
      cell: ({ row }) => (
        <div className="max-w-[100px] min-w-[100px] truncate">
          {row.original.receiptNo}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div className="min-w-[120px]">
          <span className="hidden sm:block">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
          <span className="text-muted-foreground block text-xs sm:hidden">
            {new Date(row.original.createdAt).toLocaleDateString()}{" "}
            {new Date(row.original.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="max-w-[180px] min-w-[120px] truncate">
          {row.original.customer?.name || "Walk-in"}
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => (
        <div className="min-w-[100px]">
          Rp{row.original.totalAmount.toLocaleString("id-ID")}
        </div>
      ),
    },
    {
      accessorKey: "paymentType",
      header: "Payment",
      cell: ({ row }) => (
        <PaymentMethodBadge method={row.original.paymentType} />
      ),
    },
    {
      accessorKey: "isPaid",
      header: "Status",
      cell: ({ row }) => (
        <div className="min-w-[80px]">
          {row.original.isPaid ? (
            <span className="flex items-center text-green-600">
              <Check className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Paid</span>
            </span>
          ) : (
            <span className="flex items-center text-yellow-600">
              <X className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Unpaid</span>
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="min-w-[120px]">
          {!row.original.isPaid && (
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => markAsPaid({ id: row.original.id })}
            >
              <span className="sm:hidden">✓</span>
              <span className="hidden sm:inline">Mark as Paid</span>
            </Button>
          )}
        </div>
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
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden rounded-lg border">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 text-xs whitespace-nowrap sm:text-sm"
                    >
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
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-2 text-xs whitespace-nowrap sm:text-sm"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
