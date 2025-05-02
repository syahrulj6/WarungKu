import { cn } from "~/lib/utils";
import { type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

type SidebarMenuItem = {
  title: string;
  icon: ReactNode;
  href: string;
  active?: boolean;
};

type SidebarProps = {
  menuItems: SidebarMenuItem[];
};

export const WarungSidebar = ({ menuItems }: SidebarProps) => {
  return (
    <aside className="bg-background flex h-screen w-full flex-col items-center border-r md:py-6 lg:w-40">
      {/* Logo */}
      <div className="mb-5 md:mb-8">
        <Link href="/">
          <div className="relative h-12 w-12 md:h-14 md:w-14">
            <Image
              src="/warungku-notext.png"
              alt="WarungKu Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Main Menu */}
      <nav className="flex flex-1 flex-col items-center space-y-4">
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
          "hover:bg-primary hover:text-background flex w-full items-center gap-4 rounded-lg p-2 transition lg:justify-start lg:px-4 lg:py-2",
          active ? "bg-primary text-background" : "text-muted-foreground",
        )}
      >
        <span className="text-xl">{icon}</span>
        <span className="text-sm lg:text-base">{label}</span>
      </div>
    </Link>
  );
};
