import { cn } from "~/lib/utils";
import { type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { useSession } from "~/hooks/useSession";
import { ArrowLeftToLine } from "lucide-react";
import AccountDropdown from "./AccountDropdown";

type SidebarProps = {
  menuItems: {
    title: string;
    icon: ReactNode;
    url: string;
    active?: boolean;
  }[];
};

export const WarungSidebar = ({ menuItems }: SidebarProps) => {
  const { handleSignOut } = useSession();

  return (
    <aside className="flex h-screen w-full flex-col items-center border-r bg-white py-6 lg:w-40">
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
            url={item.url}
          />
        ))}
      </nav>
    </aside>
  );
};

const SidebarItem = ({
  label,
  active,
  icon,
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
        "hover:bg-primary hover:text-background flex w-full items-center gap-4 rounded-lg p-2 transition lg:justify-start lg:px-4 lg:py-2",
        active ? "bg-primary text-background" : "text-muted-foreground",
      )}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm lg:text-base">{label}</span>
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
