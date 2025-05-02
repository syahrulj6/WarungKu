import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const MenuHeader = () => {
  const [searchMenu, setSearchMenu] = useState("");

  return (
    <div className="flex items-center justify-between">
      <div className="">
        <Input
          id="search"
          placeholder="Search menu"
          className="pl-10 text-sm md:pl-12 md:text-base"
        />
        <Label htmlFor="search">
          <Search className="text-muted-foreground absolute top-1/2 left-20 h-4 w-4 -translate-y-1/2 md:left-8 md:h-5 md:w-5" />
        </Label>
      </div>
    </div>
  );
};
