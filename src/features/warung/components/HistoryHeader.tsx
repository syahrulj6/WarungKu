import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Calendar as CalendarIcon, ChevronDown, Search } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover } from "~/components/ui/popover";

interface HistoryHeaderProps {
  formattedDate: ReactNode;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  date?: Date;
  onDateChange: (date?: Date) => void;
}

export const HistoryHeader = ({
  formattedDate,
  onSearchChange,
  searchTerm,
  date,
  onDateChange,
}: HistoryHeaderProps) => {
  const searchId = useId();

  return (
    <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="relative w-full md:w-xl">
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
  );
};
