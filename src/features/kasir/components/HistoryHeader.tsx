import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Calendar as CalendarIcon, ChevronDown, Search } from "lucide-react";
import { useId, type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover } from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export type HistoryPeriod = "today" | "7-days" | "1-month" | "1-year" | "all-time";

interface HistoryHeaderProps {
  formattedDate: ReactNode;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  date?: Date;
  onDateChange: (date?: Date) => void;
  period: HistoryPeriod;
  onPeriodChange: (period: HistoryPeriod) => void;
}

export const HistoryHeader = ({
  formattedDate,
  onSearchChange,
  searchTerm,
  date,
  onDateChange,
  period,
  onPeriodChange,
}: HistoryHeaderProps) => {
  const searchId = useId();

  return (
    <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="relative w-full md:w-2xl">
        <Input
          id={searchId}
          placeholder="Cari order by receipt nomer"
          className="w-full pl-10 text-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Label htmlFor={searchId}>
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        </Label>
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <Select
          value={period}
          onValueChange={(value) => onPeriodChange(value as HistoryPeriod)}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Pilih periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="7-days">7 Hari</SelectItem>
            <SelectItem value="1-month">1 Bulan</SelectItem>
            <SelectItem value="1-year">1 Tahun</SelectItem>
            <SelectItem value="all-time">Semua Waktu</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="text-muted-foreground text-sm">
              <CalendarIcon /> {formattedDate ?? "Filter hari"} <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              className="bg-card z-10 rounded-lg"
            />
            <Button className="w-full" onClick={() => onDateChange(undefined)}>
              Reset
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
