import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--ink)]">
            <Compass className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="truncate font-display text-lg font-extrabold tracking-tight">
            CareerQuest
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {[
            { to: "/quiz", label: "Quiz" },
            { to: "/simulation", label: "Simulate" },
            { to: "/mentor", label: "Mentor" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-2 py-2 font-medium text-foreground/70 hover:text-foreground sm:px-3"
              activeProps={{
                className:
                  "rounded-md px-2 sm:px-3 py-2 font-semibold text-foreground underline decoration-primary decoration-[3px] underline-offset-8",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}