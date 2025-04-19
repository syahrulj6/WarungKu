import { cn } from "~/lib/utils";
import { type ReactNode } from "react";
import Link from "next/link";

type MenuItem = {
  title: string;
  url: string;
  active?: boolean;
  category: string;
};

type SidebarProps = {
  menuItems: MenuItem[];
};

export const AppSidebar = ({ menuItems }: SidebarProps) => {
  // Group menu items by category with proper typing
  const groupedMenuItems = menuItems.reduce<Record<string, MenuItem[]>>(
    (acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {},
  );

  return (
    <aside className="bg-background flex h-screen w-full flex-col border-r lg:w-56">
      {/* Main Menu */}
      <nav className="flex flex-1 flex-col overflow-y-auto">
        <p className="h-14 border-b-1 px-4 py-4 font-semibold text-current md:px-6">
          WarungKu
        </p>
        {Object.entries(groupedMenuItems).map(([category, items]) => (
          <div key={category} className="border-b-1 py-5">
            <h3 className="text-muted-foreground mb-3 px-4 text-xs font-semibold uppercase md:px-6">
              {category}
            </h3>
            <div className="flex flex-col gap-2 px-4 md:px-6">
              {items.map((item) => (
                <SidebarItem
                  key={`${category}-${item.title}`}
                  label={item.title}
                  active={item.active}
                  url={item.url}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

const SidebarItem = ({
  label,
  active,
  url,
}: {
  label: string;
  active?: boolean;
  icon?: ReactNode;
  url?: string;
}) => {
  const content = (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-lg transition hover:text-current",
        active ? "text-current" : "text-muted-foreground",
      )}
    >
      <span className="text-sm">{label}</span>
    </div>
  );

  return url ? (
    <Link href={url} className="w-full">
      {content}
    </Link>
  ) : (
    <button className="w-full">{content}</button>
  );
};
