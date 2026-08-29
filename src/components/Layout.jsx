import { Link, useLocation, Outlet } from "react-router-dom";
import { QrCode, LayoutDashboard } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/lib/i18n";

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
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight"
          >
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand text-brand-foreground">
              <QrCode className="w-4 h-4" />
            </span>
            QR Studio
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              <Link to="/" className={navCls(pathname === "/")}>
                {t("nav_home")}
              </Link>
              <Link to="/dashboard" className={navCls(pathname === "/dashboard")}>
                <span className="inline-flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("nav_codes")}</span>
                  <span className="sm:hidden">{t("nav_codes_short")}</span>
                </span>
              </Link>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <Outlet />
      </main>
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-sm text-muted-foreground text-center">
          {t("footer")}
        </div>
      </footer>
    </div>
  );
}