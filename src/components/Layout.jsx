import { Link, useLocation, Outlet } from "react-router-dom";
import { QrCode, LayoutDashboard } from "lucide-react";

function navCls(active) {
  return [
    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
    active
      ? "bg-secondary text-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
  ].join(" ");
}

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight"
          >
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand text-brand-foreground">
              <QrCode className="w-4 h-4" />
            </span>
            QR Studio
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/" className={navCls(pathname === "/")}>
              Home
            </Link>
            <Link to="/dashboard" className={navCls(pathname === "/dashboard")}>
              <span className="inline-flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">My QR Codes</span>
                <span className="sm:hidden">Codes</span>
              </span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <Outlet />
      </main>
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-sm text-muted-foreground text-center">
          QR Studio — generate, publish & share scannable QR codes.
        </div>
      </footer>
    </div>
  );
}