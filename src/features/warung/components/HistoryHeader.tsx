import { Search } from "lucide-react";
import { useId } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface HistoryHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const HistoryHeader = ({
  onSearchChange,
  searchTerm,
}: HistoryHeaderProps) => {
  const searchId = useId();

  return (
    <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="relative w-xl">
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
    </div>
  );
};
