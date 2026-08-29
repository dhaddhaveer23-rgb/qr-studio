import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import QRPreview from "@/components/QRPreview";
import { isValidUrl, normalizeUrl } from "@/lib/qr";
import { useLang } from "@/lib/i18n";

export default function CreateURL() {
  const { t } = useLang();
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
        setError(t("err_load"));
      } finally {
        setLoadingRecord(false);
      }
    })();
  }, [editId]);

  const generate = async () => {
    setError("");
    if (!name.trim()) return setError(t("err_name"));
    const normalized = normalizeUrl(url.trim());
    if (!isValidUrl(normalized)) return setError(t("err_url"));
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
      setError(t("err_fail"));
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
      <BackLink label={t("back_home")} />
      <Header
        icon={LinkIcon}
        title={t("url_title")}
        subtitle={t("url_subtitle")}
      />

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">{t("qr_name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer campaign landing page"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">{t("url_label")}</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("url_placeholder")}
              inputMode="url"
            />
          </div>
          {error && <ErrorNote text={error} />}
          <Button onClick={generate} disabled={loading} size="lg" className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("generating")}
              </>
            ) : record ? (
              t("regenerate")
            ) : (
              t("generate")
            )}
          </Button>
        </div>

        <div className="lg:col-span-2">
          <PreviewPanel record={record} />
        </div>
      </div>
    </div>
  );
}

export function BackLink({ label }) {
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

export function PreviewPanel({ record }) {
  const { t } = useLang();
  if (!record)
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        {t("preview_empty")}
      </div>
    );
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 mb-5">
        <CheckCircle2 className="w-4 h-4" />
        {record.target_url ? t("published") : t("ready")}
      </div>
      <QRPreview
        value={record.target_url}
        link={record.target_url}
        filename={record.name || "qrcode"}
      />
      <div className="mt-5 pt-5 border-t border-border">
        <p className="text-xs text-muted-foreground mb-1">{t("public_link")}</p>
        <p className="text-sm font-mono break-all">{record.target_url}</p>
      </div>
    </div>
  );
}