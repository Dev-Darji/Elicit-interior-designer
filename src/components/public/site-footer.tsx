import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin } from "lucide-react";
import { getMockSettings } from "@/lib/mock-data/site-settings";

export function SiteFooter() {
  const s = getMockSettings();
  return (
    <footer className="border-t border-border/60 bg-cream text-charcoal">
      <div className="container-editorial py-20 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="font-serif text-3xl tracking-tight">
            Elicit
          </Link>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            An interior design studio shaping timeless residential, hospitality and commercial spaces, since 2010.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Studio</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/projects" className="link-underline">Projects</Link></li>
            <li><Link to="/services" className="link-underline">Services</Link></li>
            <li><Link to="/about" className="link-underline">About</Link></li>
            <li><Link to="/journal" className="link-underline">Journal</Link></li>
            <li><Link to="/contact" className="link-underline">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{s.contact.email}</li>
            <li>{s.contact.phone}</li>
            <li className="whitespace-pre-line">{s.contact.address}</li>
          </ul>
          <div className="mt-6 flex items-center gap-4">
            <a href={s.social.instagram} aria-label="Instagram" className="opacity-70 hover:opacity-100 transition-opacity">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={s.social.pinterest} aria-label="Pinterest" className="opacity-70 hover:opacity-100 text-sm">P</a>
            <a href={s.social.linkedin} aria-label="LinkedIn" className="opacity-70 hover:opacity-100 transition-opacity">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container-editorial flex flex-col sm:flex-row items-center justify-between gap-4 py-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Elicit. All rights reserved.</p>
          <p>Designed in Bangalore.</p>
        </div>
      </div>
    </footer>
  );
}
