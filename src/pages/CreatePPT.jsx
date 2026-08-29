import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Upload, CheckCircle2 } from "lucide-react";
import QRPreview from "@/components/QRPreview";
import { publicUrl } from "@/lib/qr";
import { BackLink, Header, ErrorNote, PreviewPanel } from "@/pages/CreateURL";

export default function CreatePPT() {
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
        setError("Could not load this QR code.");
      } finally {
        setLoadingRecord(false);
      }
    })();
  }, [editId]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(ppt|pptx)$/i.test(f.name))
      return setError("Please upload a .ppt or .pptx file.");
    setError("");
    setUploading(true);
    setFileName(f.name);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setFileUrl(file_url);
    } catch {
      setError("Upload failed. Please try again.");
      setFileName("");
    } finally {
      setUploading(false);
    }
  };

  const publish = async () => {
    setError("");
    if (!name.trim()) return setError("Please name your QR code.");
    if (!fileUrl) return setError("Please upload a PPT/PPTX file first.");
    setSaving(true);
    try {
      if (record) {
        const updated = await base44.entities.QRCode.update(record.id, {
          name: name.trim(),
          file_url: fileUrl,
          file_name: fileName,
          target_url: publicUrl(`/f/${record.id}`),
        });
        setRecord(updated);
      } else {
        const created = await base44.entities.QRCode.create({
          name: name.trim(),
          type: "ppt",
          file_url: fileUrl,
          file_name: fileName,
        });
        const updated = await base44.entities.QRCode.update(created.id, {
          target_url: publicUrl(`/f/${created.id}`),
        });
        setRecord(updated);
      }
    } catch {
      setError("Failed to publish. Please try again.");
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
      <BackLink label="Back to Home" />
      <Header
        icon={FileText}
        title="PPT / File QR Code"
        subtitle="Upload a presentation, publish it to a public link, and generate a QR for it."
      />

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">QR code name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 Investor Deck"
            />
          </div>

          <div className="space-y-2">
            <Label>Presentation file (.ppt / .pptx)</Label>
            <label
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center cursor-pointer transition-colors hover:border-brand/50 hover:bg-secondary/40 ${
                uploading ? "pointer-events-none opacity-70" : ""
              }`}
            >
              <input
                type="file"
                accept=".ppt,.pptx"
                className="sr-only"
                onChange={onFile}
              />
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-brand" />
                  <span className="text-sm text-muted-foreground">
                    Uploading…
                  </span>
                </>
              ) : fileName ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span className="text-sm font-medium">{fileName}</span>
                  <span className="text-xs text-muted-foreground">
                    Click to replace
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Click to upload a file
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PowerPoint .ppt or .pptx
                  </span>
                </>
              )}
            </label>
          </div>

          {error && <ErrorNote text={error} />}
          <Button onClick={publish} disabled={saving || uploading} size="lg" className="w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing…
              </>
            ) : record ? (
              "Regenerate QR code"
            ) : (
              "Publish & generate QR"
            )}
          </Button>
        </div>

        <div className="lg:col-span-2">
          <PreviewPanel record={record} type="ppt" />
        </div>
      </div>
    </div>
  );
}