import Link from "next/link";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";

const links = [
  {
    name: "Home",
    url: "/",
  },
  {
    name: "Features",
    url: "#features",
  },
  {
    name: "How it Works",
    url: "#how-it-works",
  },
  {
    name: "Pricing",
    url: "#pricing",
  },
];

export const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 z-10 flex h-16 w-full items-center justify-between px-4 transition-transform duration-300 md:h-24 md:px-8 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Link
        href={"/"}
        className="text-primary flex items-center text-lg font-bold hover:hover:cursor-pointer md:text-xl"
      >
        <div className="relative h-10 w-10 md:h-12 md:w-12">
          <Image
            src="/warungku-notext.png"
            alt="WarungKu Logo"
            fill
            sizes="(max-width: 768px) 40px, 48px"
            className="object-contain"
            priority
          />
        </div>
        <span className="relative">WarungKu</span>
      </Link>

      <nav className="hidden md:block">
        <ul className="flex items-center gap-10">
          {links.map((link) => (
            <li key={link.name}>
              <Link
                href={link.url}
                className="group text-foreground hover:text-primary relative px-1 py-2 text-sm font-medium transition-colors"
              >
                {link.name}
                <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"></span>
                <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-200 active:w-full"></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        <Button asChild variant="default">
          <Link href="/login">Try for Free</Link>
        </Button>
      </div>
    </header>
  );
};
