// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    hooks: {
      "nitro:build:before": (nitro: any) => {
        nitro.options.externals = nitro.options.externals || {};
        nitro.options.externals.external = nitro.options.externals.external || [];
        if (!nitro.options.externals.external.includes("@supabase/ssr")) {
          nitro.options.externals.external.push("@supabase/ssr");
        }
        if (!nitro.options.externals.external.includes("@supabase/supabase-js")) {
          nitro.options.externals.external.push("@supabase/supabase-js");
        }
      },
    },
  } as any, // Cast to any to bypass the narrow type definition in the config library
  vite: {
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    build: {
      minify: false,
      rolldownOptions: {
        experimental: {
          chunkOptimization: false,
        },
      } as any,
      rollupOptions: {
        experimental: {
          chunkOptimization: false,
        },
      } as any,
    },
    environments: {
      client: {
        build: {
          minify: false,
          rolldownOptions: {
            experimental: {
              chunkOptimization: false,
            },
          } as any,
          rollupOptions: {
            experimental: {
              chunkOptimization: false,
            },
          } as any,
        },
      },
      ssr: {
        build: {
          minify: false,
          rolldownOptions: {
            experimental: {
              chunkOptimization: false,
            },
          } as any,
          rollupOptions: {
            experimental: {
              chunkOptimization: false,
            },
          } as any,
        },
      },
      server: {
        build: {
          minify: false,
          rolldownOptions: {
            experimental: {
              chunkOptimization: false,
            },
          } as any,
          rollupOptions: {
            experimental: {
              chunkOptimization: false,
            },
          } as any,
        },
      },
    } as any,
    ssr: {
      external: ["vinxi/http", "@supabase/ssr", "@supabase/supabase-js"],
    },
  },
});

