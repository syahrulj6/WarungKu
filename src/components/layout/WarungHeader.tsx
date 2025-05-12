import { Button } from "../ui/button";
import { Menu, ShoppingCart } from "lucide-react";
import AccountDropdown from "./AccountDropdown";
import type React from "react";

export const WarungHeader = ({
  toggleSidebar,
  toggleRightPanel,
  className = "",
  children,
  showRightPanelButton = false,
}: {
  toggleSidebar: () => void;
  toggleRightPanel?: () => void;
  className?: string;
  children?: React.ReactNode;
  showRightPanelButton?: boolean;
}) => {
  return (
    <div className={`sticky top-0 z-40 ${className}`}>
      {/* Main header bar */}
      <header className="bg-background flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* Desktop header content - shown inline */}
          {children && <div className="hidden md:flex">{children}</div>}
        </div>
        <div className="flex items-center gap-4">
          {/* Only show if showRightPanelButton is true */}
          {showRightPanelButton && toggleRightPanel && (
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

      {/* Mobile header content - shown below header */}
      {children && (
        <div className="bg-background border-b p-4 md:hidden">{children}</div>
      )}
    </div>
  );
};
