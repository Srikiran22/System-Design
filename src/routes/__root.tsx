import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import Nav from "@/components/neet/Nav";
import Footer from "@/components/neet/Footer";
import CommandPalette from "@/components/neet/CommandPalette";
import ProgressSync from "@/components/neet/ProgressSync";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/neet/auth-client";
import { setActiveUser } from "@/lib/neet/store";

function NotFoundComponent() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-32 text-center">
      <p className="section-label text-accent">404 · Not Found</p>
      <h1 className="section-title mt-2 text-5xl text-text">Off the map.</h1>
      <p className="mt-4 text-muted">
        That page does not exist. Explore the curriculum paths, or press ⌘K to search.
      </p>
      <Link to="/paths" className="btn-ink mt-8 inline-flex">
        Browse curriculum
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md rounded-lg border border-line bg-surface-2 p-8 text-center">
        <p className="section-label text-magenta">Runtime Error</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-text">
          This page didn&apos;t load
        </h1>
        <p className="mt-2 text-sm text-muted">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-ink text-sm"
          >
            Try again
          </button>
          <a href="/" className="btn-soft text-sm">
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
      { title: "From Scratch — System Design Learning Hub" },
      {
        name: "description",
        content:
          "A hands-on, self-directed curriculum for mastering systems thinking, system design, and production engineering.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Doto:wght@400;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col bg-bg text-text antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data } = authClient.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      if (event === "SIGNED_OUT") {
        setActiveUser(null);
        queryClient.clear();
      } else {
        setActiveUser(session?.user?.id ?? null);
        queryClient.invalidateQueries();
      }
      router.invalidate();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:font-semibold focus:text-bg"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CommandPalette />
      <ProgressSync />
      <Toaster position="bottom-center" theme="dark" />
    </QueryClientProvider>
  );
}
