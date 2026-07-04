import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Sparkles className="h-4 w-4" />
          </span>
          CareerQuest
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/quiz"
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 bg-secondary text-foreground" }}
          >
            Quiz
          </Link>
          <Link
            to="/simulation"
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 bg-secondary text-foreground" }}
          >
            Simulation
          </Link>
          <Link
            to="/mentor"
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 bg-secondary text-foreground" }}
          >
            AI Mentor
          </Link>
        </nav>
      </div>
    </header>
  );
}