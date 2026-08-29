function esc(s = "") {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildVCard(d = {}) {
  const L = ["BEGIN:VCARD", "VERSION:3.0"];
  L.push(`N:${esc(d.contact_name)};;;;`);
  L.push(`FN:${esc(d.contact_name)}`);
  if (d.company_name) L.push(`ORG:${esc(d.company_name)}`);
  if (d.job_title) L.push(`TITLE:${esc(d.job_title)}`);
  if (d.phone) L.push(`TEL;TYPE=CELL,VOICE:${esc(d.phone)}`);
  if (d.whatsapp) L.push(`TEL;TYPE=WHATSAPP:${esc(d.whatsapp)}`);
  if (d.email) L.push(`EMAIL;TYPE=INTERNET:${esc(d.email)}`);
  if (d.website) L.push(`URL:${d.website}`);
  if (d.address) L.push(`ADR;TYPE=WORK:;;${esc(d.address)};;;;`);
  if (d.logo_url) L.push(`PHOTO;VALUE=URL:${d.logo_url}`);
  (d.social_links || []).forEach((s) => {
    if (s && s.url) L.push(`URL:${s.url}`);
  });
  L.push("END:VCARD");
  return L.join("\r\n");
}

export function downloadVCard(data) {
  const text = buildVCard(data);
  const blob = new Blob([text], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(data.company_name || data.contact_name || "contact")
    .replace(/\s+/g, "_")
    .replace(/[^\w-]/g, "")}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}