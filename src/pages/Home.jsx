import { Link } from "react-router-dom";
import { FileText, Link as LinkIcon, Contact, ArrowRight, QrCode, Image as ImageIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function Home() {
  const { t } = useLang();
  const options = [
    {
      to: "/create/ppt",
      icon: FileText,
      title: t("opt_ppt_title"),
      desc: t("opt_ppt_desc"),
      accent: "from-violet-500/15 to-violet-500/5",
      iconBg: "bg-violet-500/10 text-violet-600",
    },
    {
      to: "/create/logo",
      icon: ImageIcon,
      title: t("opt_logo_title"),
      desc: t("opt_logo_desc"),
      accent: "from-amber-500/15 to-amber-500/5",
      iconBg: "bg-amber-500/10 text-amber-600",
    },
    {
      to: "/create/url",
      icon: LinkIcon,
      title: t("opt_url_title"),
      desc: t("opt_url_desc"),
      accent: "from-sky-500/15 to-sky-500/5",
      iconBg: "bg-sky-500/10 text-sky-600",
    },
    {
      to: "/create/vcard",
      icon: Contact,
      title: t("opt_vcard_title"),
      desc: t("opt_vcard_desc"),
      accent: "from-emerald-500/15 to-emerald-500/5",
      iconBg: "bg-emerald-500/10 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/60 text-xs font-medium text-muted-foreground mb-6">
          <QrCode className="w-3.5 h-3.5" />
          {t("hero_badge")}
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
          {t("hero_title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-balance">
          {t("hero_subtitle")}
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((o) => (
          <Link
            key={o.to}
            to={o.to}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${o.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
            <div className="relative">
              <div className={`grid place-items-center w-12 h-12 rounded-xl ${o.iconBg} mb-5`}>
                <o.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">
                {o.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {o.desc}
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                {t("create")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold">
              {t("dash_section_title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("dash_section_desc")}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {t("go_dashboard")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}