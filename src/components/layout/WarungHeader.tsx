import { Button } from "../ui/button";
import { Menu, ShoppingCart } from "lucide-react";
import AccountDropdown from "./AccountDropdown";
import type React from "react";

export const WarungHeader = ({
  toggleSidebar,
  toggleRightPanel,
  className = "",
  children,
}: {
  toggleSidebar: () => void;
  toggleRightPanel?: () => void;
  className?: string;
  children?: React.ReactNode;
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
        <div className="flex items-center">{children}</div>
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
