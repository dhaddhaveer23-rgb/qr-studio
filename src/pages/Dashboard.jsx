import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Download,
  Copy,
  Check,
  Plus,
  Loader2,
  FileText,
  Link as LinkIcon,
  Contact,
  Image as ImageIcon,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

const editPath = {
  ppt: "/create/ppt",
  logo: "/create/logo",
  url: "/create/url",
  vcard: "/create/vcard",
};

export default function Dashboard() {
  const { t } = useLang();
  const [items, setItems] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const typeMeta = {
    ppt: { label: t("type_file"), icon: FileText, cls: "bg-violet-500/10 text-violet-600" },
    logo: { label: t("type_logo"), icon: ImageIcon, cls: "bg-amber-500/10 text-amber-600" },
    url: { label: t("type_url"), icon: LinkIcon, cls: "bg-sky-500/10 text-sky-600" },
    vcard: { label: t("type_vcard"), icon: Contact, cls: "bg-emerald-500/10 text-emerald-600" },
  };

  const load = async () => {
    try {
      const list = await base44.entities.QRCode.list("-created_date", 100);
      setItems(list);
    } catch {
      setItems([]);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm(t("delete_confirm"))) return;
    setDeleting(id);
    try {
      await base44.entities.QRCode.delete(id);
      setItems((prev) => (prev || []).filter((i) => i.id !== id));
    } catch {
      alert(t("delete_err"));
    } finally {
      setDeleting(null);
    }
  };

  const copyLink = async (item) => {
    await navigator.clipboard.writeText(item.target_url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const downloadPNG = (item) => {
    const canvas = document.getElementById(`qr-${item.id}`);
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${(item.name || "qrcode").replace(/\s+/g, "_")}.png`;
    a.click();
  };

  const openHref = (item) =>
    item.type === "ppt"
      ? `/f/${item.id}`
      : item.type === "vcard"
      ? `/v/${item.id}`
      : item.type === "logo"
      ? `/l/${item.id}`
      : item.url_value || item.target_url;

  if (items === null)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            {t("dash_title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("dash_subtitle")}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-brand-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {t("new_qr")}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">{t("empty_title")}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {t("empty_cta")}
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const meta = typeMeta[item.type] || typeMeta.url;
            const Icon = meta.icon;
            return (
              <Card key={item.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.cls}`}>
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg ring-1 ring-black/5 shrink-0">
                    <QRCodeCanvas
                      id={`qr-${item.id}`}
                      value={item.target_url || ""}
                      size={64}
                      level="M"
                      marginSize={1}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground font-mono break-all mb-4 line-clamp-2">
                  {item.target_url}
                </p>

                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`${editPath[item.type] || "/create/url"}?id=${item.id}`}>
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      {t("act_edit")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={openHref(item)} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      {t("act_open")}
                    </a>
                  </Button>
                  <Button onClick={() => downloadPNG(item)} variant="outline" size="sm" className="w-full">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    {t("png")}
                  </Button>
                  <Button onClick={() => copyLink(item)} variant="outline" size="sm" className="w-full">
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        {t("copied")}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        {t("act_copy")}
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  onClick={() => remove(item.id)}
                  disabled={deleting === item.id}
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {deleting === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {t("act_delete")}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}