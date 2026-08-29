import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Contact,
  QrCode,
  Phone,
  Mail,
  Globe,
  MapPin,
  MessageCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import { downloadVCard } from "@/lib/vcard";

export default function VCardViewer() {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setRec(await base44.entities.QRCode.get(id));
      } catch {
        setError("This contact card is no longer available.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/30">
        <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
      </div>
    );

  if (error || !rec || rec.type !== "vcard")
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/30 px-4">
        <div className="text-center max-w-md">
          <Contact className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold mb-2">Contact unavailable</h1>
          <p className="text-muted-foreground">{error || "This contact card could not be found."}</p>
        </div>
      </div>
    );

  const v = rec.vcard || {};
  const socials = (v.social_links || []).filter((s) => s.url);

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold">
            <span className="grid place-items-center w-7 h-7 rounded-md bg-brand text-brand-foreground">
              <QrCode className="w-3.5 h-3.5" />
            </span>
            QR Studio
          </Link>
        </div>
      </header>
      <main className="flex-1 grid place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-brand/15 to-brand/5 p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden grid place-items-center mb-4">
                {v.logo_url ? (
                  <img src={v.logo_url} alt={v.company_name} className="w-full h-full object-cover" />
                ) : (
                  <Contact className="w-9 h-9 text-brand" />
                )}
              </div>
              <h1 className="font-display text-2xl font-semibold">
                {v.contact_name || v.company_name || "Contact"}
              </h1>
              {v.job_title && (
                <p className="text-sm text-muted-foreground mt-0.5">{v.job_title}</p>
              )}
              {v.company_name && v.contact_name && (
                <p className="text-sm font-medium text-brand mt-1.5">{v.company_name}</p>
              )}
            </div>

            <div className="p-6 space-y-1">
              {v.phone && <Row icon={Phone} text={v.phone} href={`tel:${v.phone}`} />}
              {v.whatsapp && (
                <Row
                  icon={MessageCircle}
                  text={v.whatsapp}
                  href={`https://wa.me/${v.whatsapp.replace(/[^\d]/g, "")}`}
                />
              )}
              {v.email && <Row icon={Mail} text={v.email} href={`mailto:${v.email}`} />}
              {v.website && (
                <Row icon={Globe} text={prettyUrl(v.website)} href={v.website} />
              )}
              {v.address && <Row icon={MapPin} text={v.address} href={mapsUrl(v.address)} />}

              {socials.length > 0 && (
                <div className="pt-3 mt-2 border-t border-border">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Social
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {socials.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium hover:bg-secondary/70 transition-colors"
                      >
                        {s.platform || "Link"}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => downloadVCard(v)}
            size="lg"
            className="w-full mt-4"
          >
            <Download className="w-4 h-4 mr-2" />
            Save to contacts
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Adds this contact to your phone's address book.
          </p>
        </div>
      </main>
    </div>
  );
}

function Row({ icon: Icon, text, href }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-secondary/60 transition-colors"
    >
      <span className="grid place-items-center w-9 h-9 rounded-lg bg-secondary text-foreground shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-sm font-medium break-all">{text}</span>
    </a>
  );
}

function prettyUrl(u = "") {
  return u.replace(/^https?:\/\//, "");
}
function mapsUrl(a = "") {
  return `https://maps.google.com/?q=${encodeURIComponent(a)}`;
}