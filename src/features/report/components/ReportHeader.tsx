import { CalendarIcon, NotebookIcon, Loader } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface ReportHeaderProps {
  onTimePeriodChange: (value: string) => void;
  onExportFormatChange: (value: string) => void;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  isExporting?: boolean;
}

export const ReportHeader = ({
  onTimePeriodChange,
  onExportFormatChange,
  dateRange,
  onDateRangeChange,
  isExporting = false,
}: ReportHeaderProps) => {
  const dateLabel = dateRange?.from
    ? `Dari ${format(dateRange.from, "dd MMM yyyy")} sampai ${format(
        dateRange.to ?? dateRange.from,
        "dd MMM yyyy",
      )}`
    : "Filter Tanggal";

  return (
    <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <Select onValueChange={onTimePeriodChange} defaultValue="7-hari">
        <SelectTrigger className="w-fit">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <SelectValue placeholder="7 Hari" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7-hari">7 Hari</SelectItem>
          <SelectItem value="30-hari">30 Hari</SelectItem>
          <SelectItem value="1-tahun">1 Tahun</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={onExportFormatChange} disabled={isExporting}>
        <SelectTrigger className="w-fit">
          {isExporting ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <NotebookIcon className="mr-2 h-4 w-4" />
          )}
          <SelectValue placeholder={isExporting ? "Exporting..." : "Export"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="excel">Excel</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => onDateRangeChange(undefined)}
          >
            Reset Tanggal
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};
