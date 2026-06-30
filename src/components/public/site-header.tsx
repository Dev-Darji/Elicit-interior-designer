import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/journal", label: "Journal" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const transparent = isHome && !scrolled && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          transparent
            ? "bg-transparent text-cream"
            : "bg-cream/80 text-charcoal backdrop-blur-md border-b border-border/50"
        }`}
      >
        <div className="container-editorial flex h-20 items-center justify-between">
          <Link 
            to="/" 
            className="font-serif text-xl sm:text-2xl tracking-[0.2em] uppercase flex items-center select-none font-semibold hover:opacity-90 transition-opacity"
          >
            <span>E</span>
            <span className={`transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap inline-block ${
              scrolled ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100 ml-1"
            }`}>
              licit
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.2em]">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="link-underline"
                activeProps={{ className: "link-underline opacity-100" }}
                inactiveProps={{ className: "link-underline opacity-70 hover:opacity-100" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <button
            aria-label="Open menu"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-cream transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-8 text-charcoal">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="font-serif text-3xl">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
