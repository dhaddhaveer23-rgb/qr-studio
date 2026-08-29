export function isValidUrl(u = "") {
  try {
    const x = new URL(u);
    return x.protocol === "http:" || x.protocol === "https:";
  } catch {
    return false;
  }
}

export function publicUrl(path) {
  return `${window.location.origin}${path}`;
}

export function normalizeUrl(u = "") {
  if (!u) return u;
  if (!/^https?:\/\//i.test(u)) return `https://${u}`;
  return u;
}