import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-serif text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-serif text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-foreground px-6 py-3 text-sm uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-serif text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="border border-foreground px-6 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-foreground/40 px-6 py-3 text-sm uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Elicit — Interior Design Studio" },
      { name: "description", content: "Elicit is an interior design studio crafting timeless, considered spaces for residences, hospitality and commercial environments." },
      { name: "author", content: "Elicit" },
      { property: "og:title", content: "Elicit — Interior Design Studio" },
      { property: "og:description", content: "Timeless interiors for residences, hospitality and commercial spaces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { 
        rel: "stylesheet", 
        href: appCss && !appCss.startsWith("/") && !appCss.startsWith("http") ? `/${appCss}` : appCss 
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style dangerouslySetInnerHTML={{ __html: `
          #initial-loader {
            position: fixed;
            inset: 0;
            background-color: #f5f5f0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            opacity: 1;
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .loader-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          .loader-logo {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 3.5rem;
            font-weight: 500;
            color: #1a1a1a;
            letter-spacing: 0.1em;
            animation: loader-pulse 1.6s ease-in-out infinite;
          }
          .loader-line {
            width: 60px;
            height: 1px;
            background-color: rgba(26, 26, 26, 0.1);
            position: relative;
            overflow: hidden;
          }
          .loader-line::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 50%;
            background-color: #1a1a1a;
            animation: loader-bar 1.2s cubic-bezier(0.65, 0.05, 0.36, 1) infinite;
          }
          @keyframes loader-pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1.02); }
          }
          @keyframes loader-bar {
            0% { left: -50%; }
            100% { left: 100%; }
          }
          #initial-loader.fade-out {
            opacity: 0;
            pointer-events: none;
          }
        `}} />
      </head>
      <body>
        <div id="initial-loader">
          <div className="loader-content">
            <div className="loader-logo">E</div>
            <div className="loader-line"></div>
          </div>
        </div>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    // Fade out and remove initial server-rendered loader after hydration
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.classList.add("fade-out");
      const timer = setTimeout(() => {
        loader.remove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
