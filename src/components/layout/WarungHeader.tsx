import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import AccountDropdown from "./AccountDropdown";

export const WarungHeader = ({
  toggleSidebar,
  className = "",
}: {
  toggleSidebar: () => void;
  className?: string;
}) => {
  return (
    <header
      className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 ${className}`}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <AccountDropdown />
      </div>
    </header>
  );
};
