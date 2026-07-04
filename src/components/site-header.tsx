import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[13px] font-semibold text-primary-foreground"
            style={{ background: "var(--grad-primary)", boxShadow: "0 8px 24px -8px oklch(0.72 0.18 295 / 0.6)" }}
          >
            C
          </span>
          <span className="font-display text-lg tracking-tight sm:text-xl">
            Career<em className="text-gradient not-italic">Quest</em>
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
              className="rounded-full px-3 py-1.5 font-medium text-foreground/60 transition hover:text-foreground sm:px-4"
              activeProps={{
                className:
                  "rounded-full px-3 sm:px-4 py-1.5 font-medium text-foreground bg-white/5 border border-white/10",
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