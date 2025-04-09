import Link from "next/link";
import { Button } from "../button";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      className={`border-border bg-secondary fixed top-0 z-10 flex h-16 w-full items-center justify-between border-b-2 px-4 transition-transform duration-300 md:h-20 md:px-8 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Link
        href={"/"}
        className="text-primary text-2xl font-bold hover:hover:cursor-pointer md:text-3xl"
      >
        Qypi
      </Link>

      <div className="flex items-center gap-4">
        <Button asChild variant="default">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </header>
  );
};
