import Link from "next/link";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "~/hooks/useSession";

const links = [
  { name: "Home", url: "/" },
  { name: "Features", url: "#features" },
  { name: "How it Works", url: "#how-it-works" },
  { name: "Pricing", url: "#pricing" },
];

export const Header = () => {
  const { session, loading, handleSignOut } = useSession();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header
        className={`fixed top-0 z-50 flex h-16 w-full items-center justify-between px-4 transition-transform duration-300 md:h-24 md:px-8 ${
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

        {/* Desktop Navigation */}
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
          {loading ? (
            <div className="hidden h-10 w-24 animate-pulse rounded-md bg-gray-200 md:flex" />
          ) : session ? (
            <>
              {/* Desktop Logout */}
              <Button
                variant="destructive"
                className="hidden md:flex"
                onClick={handleSignOut}
              >
                Log out
              </Button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <div className="space-y-1.5">
                  <span
                    className={`bg-foreground block h-0.5 w-6 transition-all ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`}
                  ></span>
                  <span
                    className={`bg-foreground block h-0.5 w-6 transition-all ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`}
                  ></span>
                  <span
                    className={`bg-foreground block h-0.5 w-6 transition-all ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`}
                  ></span>
                </div>
              </button>
            </>
          ) : (
            <Button asChild variant="default" className="hidden md:flex">
              <Link href="/login">Try for Free</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`bg-background fixed top-16 left-0 z-40 w-full shadow-lg transition-all duration-300 md:hidden ${
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col space-y-4 p-4">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.url}
              className="border-border text-foreground hover:text-primary border-b py-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {session ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                handleSignOut();
                setMobileMenuOpen(false);
              }}
            >
              Log out
            </Button>
          ) : (
            <Button asChild variant="default" className="w-full">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                Try for Free
              </Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
