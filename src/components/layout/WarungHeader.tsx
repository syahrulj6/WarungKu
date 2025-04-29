import { Button } from "../ui/button";
import { Menu, PanelLeftOpen, ShoppingCart } from "lucide-react";
import { useSession } from "~/hooks/useSession";
import AccountDropdown from "./AccountDropdown";

export const WarungHeader = ({
  toggleSidebar,
  toggleRightPanel,
  className = "",
}: {
  toggleSidebar: () => void;
  toggleRightPanel?: () => void;
  className?: string;
}) => {
  return (
    <header
      className={`bg-background sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 ${className}`}
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
        <h1 className="text-lg font-semibold">WarungKu POS</h1>
      </div>
      <div className="flex items-center gap-4">
        {toggleRightPanel && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={toggleRightPanel}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        )}
        <AccountDropdown />
      </div>
    </header>
  );
};
