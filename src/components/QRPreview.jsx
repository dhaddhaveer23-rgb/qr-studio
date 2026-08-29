import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, Share2 } from "lucide-react";

export default function QRPreview({ value, link, filename = "qrcode", size = 220 }) {
  const wrapRef = useRef(null);
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const downloadPNG = () => {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${filename || "qrcode"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link || value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    const url = link || value;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        /* user cancelled */
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={wrapRef}
        className="p-4 bg-white rounded-2xl shadow-sm ring-1 ring-black/5"
      >
        <QRCodeCanvas value={value} size={size} level="M" marginSize={2} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={downloadPNG} size="sm">
          <Download className="w-4 h-4 mr-1.5" />
          PNG
        </Button>
        <Button onClick={copyLink} variant="outline" size="sm">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1.5" />
              Copy link
            </>
          )}
        </Button>
        <Button onClick={share} variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-1.5" />
          Share
        </Button>
      </div>
    </div>
  );
}