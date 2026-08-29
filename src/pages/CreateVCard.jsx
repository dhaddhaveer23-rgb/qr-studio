import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Contact, Loader2, Upload, Plus, Trash2, CheckCircle2, Image as ImageIcon } from "lucide-react";
import QRPreview from "@/components/QRPreview";
import { publicUrl } from "@/lib/qr";
import { BackLink, Header, ErrorNote, PreviewPanel } from "@/pages/CreateURL";

const empty = {
  company_name: "",
  contact_name: "",
  job_title: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  whatsapp: "",
  social_links: [],
  logo_url: "",
};

export default function CreateVCard() {
  const [params] = useSearchParams();
  const editId = params.get("id");
  const [name, setName] = useState("");
  const [v, setV] = useState(empty);
  const [logoName, setLogoName] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [record, setRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(!!editId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const r = await base44.entities.QRCode.get(editId);
        setName(r.name || "");
        setV({ ...empty, ...(r.vcard || {}) });
        setLogoName(r.vcard?.logo_url ? "logo uploaded" : "");
        setRecord(r);
      } catch {
        setError("Could not load this QR code.");
      } finally {
        setLoadingRecord(false);
      }
    })();
  }, [editId]);

  const set = (k, val) => setV((p) => ({ ...p, [k]: val }));

  const onLogo = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) return setError("Please upload an image file for the logo.");
    setError("");
    setUploadingLogo(true);
    setLogoName(f.name);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      set("logo_url", file_url);
    } catch {
      setError("Logo upload failed. Please try again.");
      setLogoName("");
    } finally {
      setUploadingLogo(false);
    }
  };

  const addSocial = () =>
    set("social_links", [...(v.social_links || []), { platform: "", url: "" }]);
  const updateSocial = (i, key, val) => {
    const arr = [...(v.social_links || [])];
    arr[i] = { ...arr[i], [key]: val };
    set("social_links", arr);
  };
  const removeSocial = (i) => {
    const arr = [...(v.social_links || [])];
    arr.splice(i, 1);
    set("social_links", arr);
  };

  const generate = async () => {
    setError("");
    if (!name.trim()) return setError("Please name your QR code.");
    if (!v.contact_name?.trim() && !v.company_name?.trim())
      return setError("Add at least a company or contact name.");
    setSaving(true);
    const payload = {
      name: name.trim(),
      type: "vcard",
      vcard: {
        ...v,
        social_links: (v.social_links || []).filter((s) => s.url?.trim()),
      },
    };
    try {
      if (record) {
        const updated = await base44.entities.QRCode.update(record.id, {
          ...payload,
          target_url: publicUrl(`/v/${record.id}`),
        });
        setRecord(updated);
      } else {
        const created = await base44.entities.QRCode.create(payload);
        const updated = await base44.entities.QRCode.update(created.id, {
          target_url: publicUrl(`/v/${created.id}`),
        });
        setRecord(updated);
      }
    } catch {
      setError("Failed to generate QR code. Please try again.");
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
        icon={Contact}
        title="Company vCard QR Code"
        subtitle="Build a digital business card. Scanning shows your info and saves to contacts."
      />

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">QR code name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp contact card"
            />
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Company logo</Label>
            <label className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 cursor-pointer hover:border-brand/50 hover:bg-secondary/40 transition-colors">
              <input type="file" accept="image/*" className="sr-only" onChange={onLogo} />
              <div className="grid place-items-center w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                {v.logo_url ? (
                  <img src={v.logo_url} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                {uploadingLogo ? (
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                  </span>
                ) : v.logo_url ? (
                  <>
                    <span className="text-sm font-medium block truncate">{logoName}</span>
                    <span className="text-xs text-muted-foreground">Click to replace</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium block">Upload logo</span>
                    <span className="text-xs text-muted-foreground">PNG or JPG</span>
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Company name" value={v.company_name} onChange={(e) => set("company_name", e.target.value)} />
            <Field label="Contact person" value={v.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
            <Field label="Job title" value={v.job_title} onChange={(e) => set("job_title", e.target.value)} />
            <Field label="Phone number" value={v.phone} onChange={(e) => set("phone", e.target.value)} />
            <Field label="Email" value={v.email} onChange={(e) => set("email", e.target.value)} type="email" />
            <Field label="Website" value={v.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
            <Field label="WhatsApp number" value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Company address</Label>
            <Textarea
              id="address"
              value={v.address}
              onChange={(e) => set("address", e.target.value)}
              rows={2}
              placeholder="Street, city, country"
            />
          </div>

          {/* Social links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Social media links</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSocial}>
                <Plus className="w-4 h-4 mr-1.5" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {(v.social_links || []).map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    className="sm:w-40"
                    placeholder="Platform"
                    value={s.platform}
                    onChange={(e) => updateSocial(i, "platform", e.target.value)}
                  />
                  <Input
                    className="flex-1"
                    placeholder="https://"
                    value={s.url}
                    onChange={(e) => updateSocial(i, "url", e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSocial(i)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              {!(v.social_links || []).length && (
                <p className="text-xs text-muted-foreground">No social links added yet.</p>
              )}
            </div>
          </div>

          {error && <ErrorNote text={error} />}
          <Button onClick={generate} disabled={saving || uploadingLogo} size="lg" className="w-full sm:w-auto">
            {saving ? (
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
          <PreviewPanel record={record} type="vcard" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", ...props }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} {...props} />
    </div>
  );
}