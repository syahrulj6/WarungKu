import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";

interface ReportData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  orders: {
    current: number;
    previous: number;
    change: number;
  };
  customers: {
    current: number;
    previous: number;
    change: number;
  };
  lowStock: number;
  chartData: Array<{ date: string; count: number }>;
  timePeriod: string;
  warungName?: string;
}

export const generatePDFReport = async (
  data: ReportData,
  warungName: string = "Warung",
) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with automatic line wrapping
  const addText = (
    text: string,
    x: number,
    y: number,
    fontSize: number = 12,
    fontStyle: "normal" | "bold" = "normal",
  ) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", fontStyle);
    pdf.text(text, x, y);
    return y + fontSize * 0.35; // Return next y position
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `Rp${amount.toLocaleString("id-ID")}`;
  };

  // Helper function to format percentage
  const formatPercentage = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  // Header
  yPosition = addText(`Laporan ${warungName}`, 20, yPosition, 20, "bold");
  yPosition = addText(
    `Periode: ${
      data.timePeriod === "7-days"
        ? "Last 7 Days"
        : data.timePeriod === "30-days"
          ? "Last 30 Days"
          : "Last 1 Year"
    }`,
    20,
    yPosition + 5,
    12,
  );
  yPosition = addText(
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm")}`,
    20,
    yPosition + 5,
    10,
  );

  yPosition += 10;

  // Draw line separator
  pdf.setLineWidth(0.5);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Metrics Section
  yPosition = addText("RINGKASAN METRICS", 20, yPosition, 16, "bold");
  yPosition += 5;

  // Revenue
  yPosition = addText("Pendapatan:", 20, yPosition, 12, "bold");
  yPosition = addText(
    `Current: ${formatCurrency(data.revenue.current)}`,
    25,
    yPosition + 5,
  );
  yPosition = addText(
    `Previous: ${formatCurrency(data.revenue.previous)}`,
    25,
    yPosition + 3,
  );
  yPosition = addText(
    `Change: ${formatPercentage(data.revenue.change)}`,
    25,
    yPosition + 3,
  );
  yPosition += 5;

  // Orders
  yPosition = addText("Pesanan:", 20, yPosition, 12, "bold");
  yPosition = addText(`Current: ${data.orders.current}`, 25, yPosition + 5);
  yPosition = addText(`Previous: ${data.orders.previous}`, 25, yPosition + 3);
  yPosition = addText(
    `Change: ${formatPercentage(data.orders.change)}`,
    25,
    yPosition + 3,
  );
  yPosition += 5;

  // Customers
  yPosition = addText("Pelanggan:", 20, yPosition, 12, "bold");
  yPosition = addText(`Current: ${data.customers.current}`, 25, yPosition + 5);
  yPosition = addText(
    `Previous: ${data.customers.previous}`,
    25,
    yPosition + 3,
  );
  yPosition = addText(
    `Change: ${formatPercentage(data.customers.change)}`,
    25,
    yPosition + 3,
  );
  yPosition += 5;

  // Low Stock
  yPosition = addText("Stok Rendah:", 20, yPosition, 12, "bold");
  yPosition = addText(`${data.lowStock} produk`, 25, yPosition + 5);
  yPosition += 10;

  // Sales Summary Table
  yPosition = addText("RINGKASAN PENJUALAN", 20, yPosition, 16, "bold");
  yPosition += 10;

  // Table headers
  const tableHeaders = ["Name", "Sales", "Refunds", "Net"];
  const tableData = [
    [
      "Gross Sales",
      formatCurrency(data.revenue.current),
      "0",
      formatCurrency(data.revenue.current),
    ],
    [
      "Net Sales",
      formatCurrency(data.revenue.current),
      "0",
      formatCurrency(data.revenue.current),
    ],
    [
      "Total Collected",
      formatCurrency(data.revenue.current),
      "0",
      formatCurrency(data.revenue.current),
    ],
  ];

  const tableWidth = pageWidth - 40;
  const columnWidth = tableWidth / 4;
  const rowHeight = 8;

  // Draw table headers
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, yPosition, tableWidth, rowHeight, "F");

  tableHeaders.forEach((header, index) => {
    addText(header, 22 + index * columnWidth, yPosition + 5, 10, "bold");
  });

  yPosition += rowHeight;

  // Draw table data
  tableData.forEach((row, rowIndex) => {
    if (rowIndex % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(20, yPosition, tableWidth, rowHeight, "F");
    }

    row.forEach((cell, cellIndex) => {
      addText(cell, 22 + cellIndex * columnWidth, yPosition + 5, 9);
    });

    yPosition += rowHeight;
  });

  // Chart Data Section (if there's space)
  if (yPosition < pageHeight - 60) {
    yPosition += 10;
    yPosition = addText("DATA AKTIVITAS", 20, yPosition, 16, "bold");
    yPosition += 5;

    // Display chart data as text (since we can't easily embed the actual chart)
    data.chartData.slice(0, 10).forEach((item) => {
      yPosition = addText(
        `${item.date}: ${item.count} aktivitas`,
        25,
        yPosition + 4,
        9,
      );
    });

    if (data.chartData.length > 10) {
      yPosition = addText(
        `... dan ${data.chartData.length - 10} data lainnya`,
        25,
        yPosition + 4,
        9,
      );
    }
  }

  // Footer
  const footerY = pageHeight - 20;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text("Generated by Warung Management System", 20, footerY);
  pdf.text(`Page 1 of 1`, pageWidth - 40, footerY);

  // Save the PDF
  const fileName = `laporan-${warungName.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  pdf.save(fileName);
};
