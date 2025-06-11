import { CalendarIcon, NotebookIcon, Loader } from "lucide-react";
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
  isExporting?: boolean;
}

export const ReportHeader = ({
  onTimePeriodChange,
  onExportFormatChange,
  isExporting = false,
}: ReportHeaderProps) => {
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
    </div>
  );
};
