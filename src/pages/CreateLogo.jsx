import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Loader2, Upload, CheckCircle2 } from "lucide-react";
import QRPreview from "@/components/QRPreview";
import { publicUrl } from "@/lib/qr";
import { useLang } from "@/lib/i18n";
import { BackLink, Header, ErrorNote, PreviewPanel } from "@/pages/CreateURL";

export default function CreateLogo() {
  const { t } = useLang();
  const [params] = useSearchParams();
  const editId = params.get("id");
  const [name, setName] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [record, setRecord] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(!!editId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const r = await base44.entities.QRCode.get(editId);
        setName(r.name || "");
        setFileName(r.file_name || "");
        setFileUrl(r.file_url || "");
        setRecord(r);
      } catch {
        setError(t("err_load"));
      } finally {
        setLoadingRecord(false);
      }
    })();
  }, [editId]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) return setError(t("err_logo_file"));
    setError("");
    setUploading(true);
    setFileName(f.name);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setFileUrl(file_url);
    } catch {
      setError(t("err_logo_upload"));
      setFileName("");
    } finally {
      setUploading(false);
    }
  };

  const publish = async () => {
    setError("");
    if (!name.trim()) return setError(t("err_name"));
    if (!fileUrl) return setError(t("err_logo_required"));
    setSaving(true);
    try {
      if (record) {
        const updated = await base44.entities.QRCode.update(record.id, {
          name: name.trim(),
          file_url: fileUrl,
          file_name: fileName,
          target_url: publicUrl(`/l/${record.id}`),
        });
        setRecord(updated);
      } else {
        const created = await base44.entities.QRCode.create({
          name: name.trim(),
          type: "logo",
          file_url: fileUrl,
          file_name: fileName,
        });
        const updated = await base44.entities.QRCode.update(created.id, {
          target_url: publicUrl(`/l/${created.id}`),
        });
        setRecord(updated);
      }
    } catch {
      setError(t("err_logo_publish"));
    } finally {
      setSaving(false);
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
      <Header icon={ImageIcon} title={t("logo_title")} subtitle={t("logo_subtitle")} />

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">{t("qr_name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Company logo"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("logo_label")}</Label>
            <label
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center cursor-pointer transition-colors hover:border-brand/50 hover:bg-secondary/40 ${
                uploading ? "pointer-events-none opacity-70" : ""
              }`}
            >
              <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-brand" />
                  <span className="text-sm text-muted-foreground">{t("logo_uploading")}</span>
                </>
              ) : fileName ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span className="text-sm font-medium">{fileName}</span>
                  <span className="text-xs text-muted-foreground">{t("logo_replace")}</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm font-medium">{t("logo_upload_click")}</span>
                  <span className="text-xs text-muted-foreground">{t("logo_upload_hint")}</span>
                </>
              )}
            </label>
          </div>

          {error && <ErrorNote text={error} />}
          <Button onClick={publish} disabled={saving || uploading} size="lg" className="w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("publishing")}
              </>
            ) : record ? (
              t("regenerate")
            ) : (
              t("publish_generate")
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