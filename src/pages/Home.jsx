import { Link } from "react-router-dom";
import { FileText, Link as LinkIcon, Contact, ArrowRight, QrCode } from "lucide-react";

const options = [
  {
    to: "/create/ppt",
    icon: FileText,
    title: "PPT / File QR",
    desc: "Upload a presentation, publish it to a public link, and generate a QR that lets anyone download it.",
    accent: "from-violet-500/15 to-violet-500/5",
    iconBg: "bg-violet-500/10 text-violet-600",
  },
  {
    to: "/create/url",
    icon: LinkIcon,
    title: "URL QR",
    desc: "Paste any website link and instantly get a scannable QR code that opens it on any phone.",
    accent: "from-sky-500/15 to-sky-500/5",
    iconBg: "bg-sky-500/10 text-sky-600",
  },
  {
    to: "/create/vcard",
    icon: Contact,
    title: "Company vCard QR",
    desc: "Build a digital business card with logo & socials. Scanning shows your info and saves to contacts.",
    accent: "from-emerald-500/15 to-emerald-500/5",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/60 text-xs font-medium text-muted-foreground mb-6">
          <QrCode className="w-3.5 h-3.5" />
          Three QR types · one studio
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
          Generate beautiful QR codes in seconds.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-balance">
          Choose a type, add your content, and publish a scannable QR with a
          permanent public link — ready to download or share.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              <div
                className={`grid place-items-center w-12 h-12 rounded-xl ${o.iconBg} mb-5`}
              >
                <o.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {o.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {o.desc}
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                Create
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
              Manage everything in one place
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              View, edit, regenerate, download or share the QR codes you've
              already created.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Go to My QR Codes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}