import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText, QrCode } from "lucide-react";

export default function FileViewer() {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setRec(await base44.entities.QRCode.get(id));
      } catch {
        setError("This file is no longer available or the link has been removed.");
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

  if (error || !rec || rec.type !== "ppt")
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/30 px-4">
        <div className="text-center max-w-md">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold mb-2">File unavailable</h1>
          <p className="text-muted-foreground">{error || "This file could not be found."}</p>
        </div>
      </div>
    );

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
      <main className="flex-1 grid place-items-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="grid place-items-center w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-600 mx-auto mb-5">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-1 break-words">
            {rec.file_name || rec.name}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Download the presentation to your device.
          </p>
          <Button asChild size="lg" className="w-full">
            <a href={rec.file_url} download={rec.file_name || undefined}>
              <Download className="w-4 h-4 mr-2" />
              Download file
            </a>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Shared via QR Studio
          </p>
        </div>
      </main>
    </div>
  );
}