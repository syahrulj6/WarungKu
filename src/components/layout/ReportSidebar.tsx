import { cn } from "~/lib/utils";
import { type ReactNode } from "react";
import Link from "next/link";

type SidebarMenuItem = {
  title: string;
  icon: ReactNode;
  href: string;
  active?: boolean;
};

type SidebarProps = {
  menuItems: SidebarMenuItem[];
};

export const ReportSidebar = ({ menuItems }: SidebarProps) => {
  return (
    <aside className="bg-background flex h-full w-full flex-col py-6 md:mt-20">
      {/* Report Menu Items */}
      <nav className="flex flex-1 flex-col space-y-4 px-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.title}
            label={item.title}
            icon={item.icon}
            active={item.active}
            href={item.href}
          />
        ))}
      </nav>
    </aside>
  );
};

type SidebarItemProps = {
  label: string;
  active?: boolean;
  icon?: ReactNode;
  href: string;
};

const SidebarItem = ({ label, active, icon, href }: SidebarItemProps) => {
  return (
    <Link href={href} className="w-full">
      <div
        className={cn(
          "hover:bg-primary hover:text-background flex w-full items-center gap-3 rounded-lg px-3 py-2 transition",
          active ? "bg-primary text-background" : "text-muted-foreground",
        )}
      >
        <span>{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
};
