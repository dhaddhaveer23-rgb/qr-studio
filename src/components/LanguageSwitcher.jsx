import { useLang, LANGUAGES } from "@/lib/i18n";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useLang();
  return (
    <label className="relative inline-flex items-center">
      <Globe className="pointer-events-none absolute left-2.5 w-4 h-4 text-muted-foreground" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Language"
        className={`appearance-none rounded-lg border border-border bg-background pl-8 ${
          compact ? "pr-7 py-1.5" : "pr-8 py-2"
        } text-sm font-medium text-foreground cursor-pointer hover:bg-secondary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring`}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 text-muted-foreground text-xs">▾</span>
    </label>
  );
}