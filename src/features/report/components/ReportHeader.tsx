import { CalendarIcon, ChevronDown, NotebookIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const ReportHeader = () => {
  return (
    <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <Select>
        <SelectTrigger className="w-fit">
          <CalendarIcon />
          <SelectValue placeholder="Last 7 Days" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7-days">Last 7 Days</SelectItem>
          <SelectItem value="30-days">Last 30 Days</SelectItem>
          <SelectItem value="1-year">Lasy 1 Year</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-fit">
          <NotebookIcon />
          <SelectValue placeholder="Export" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pdf">Pdf</SelectItem>
          <SelectItem value="excel">Excel</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
