import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import QRPreview from "@/components/QRPreview";
import { isValidUrl, normalizeUrl } from "@/lib/qr";

export default function CreateURL() {
  const [params] = useSearchParams();
  const editId = params.get("id");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(!!editId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const r = await base44.entities.QRCode.get(editId);
        setName(r.name || "");
        setUrl(r.url_value || "");
        setRecord(r);
      } catch {
        setError("Could not load this QR code.");
      } finally {
        setLoadingRecord(false);
      }
    })();
  }, [editId]);

  const generate = async () => {
    setError("");
    if (!name.trim()) return setError("Please name your QR code.");
    const normalized = normalizeUrl(url.trim());
    if (!isValidUrl(normalized))
      return setError("Please enter a valid URL (e.g. https://example.com).");
    setLoading(true);
    try {
      if (record) {
        const updated = await base44.entities.QRCode.update(record.id, {
          name: name.trim(),
          url_value: normalized,
          target_url: normalized,
        });
        setRecord(updated);
      } else {
        const created = await base44.entities.QRCode.create({
          name: name.trim(),
          type: "url",
          url_value: normalized,
          target_url: normalized,
        });
        setRecord(created);
      }
    } catch {
      setError("Failed to generate QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingRecord)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-8">
      <BackLink label="Back to Home" />
      <Header
        icon={LinkIcon}
        title="URL QR Code"
        subtitle="Turn any website link into an instantly scannable QR code."
      />

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">QR code name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer campaign landing page"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Destination URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              inputMode="url"
            />
          </div>
          {error && <ErrorNote text={error} />}
          <Button onClick={generate} disabled={loading} size="lg" className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating…
              </>
            ) : record ? (
              "Regenerate QR code"
            ) : (
              "Generate QR code"
            )}
          </Button>
        </div>

        <div className="lg:col-span-2">
          <PreviewPanel record={record} type="url" />
        </div>
      </div>
    </div>
  );
}

export function BackLink({ label = "Back" }) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Link>
  );
}

export function Header({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid place-items-center w-11 h-11 rounded-xl bg-brand/10 text-brand shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export function ErrorNote({ text }) {
  return (
    <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
      {text}
    </div>
  );
}

export function PreviewPanel({ record, type }) {
  if (!record)
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Your QR code preview will appear here once generated.
      </div>
    );
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 mb-5">
        <CheckCircle2 className="w-4 h-4" />
        {record.updated_date && record.target_url ? "Published" : "Ready"}
      </div>
      <QRPreview
        value={record.target_url}
        link={record.target_url}
        filename={record.name || "qrcode"}
      />
      <div className="mt-5 pt-5 border-t border-border">
        <p className="text-xs text-muted-foreground mb-1">Public link</p>
        <p className="text-sm font-mono break-all">{record.target_url}</p>
      </div>
    </div>
  );
}