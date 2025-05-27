import { CalendarIcon, ChevronDown, NotebookIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

export const ReportHeader = () => {
  return (
    <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <Button size="sm" variant="outline" className="text-muted-foreground">
        <CalendarIcon /> Last 7 Days <ChevronDown />
      </Button>
      <Button size="sm" variant="outline" className="text-muted-foreground">
        <NotebookIcon /> Export <ChevronDown />
      </Button>
    </div>
  );
};
