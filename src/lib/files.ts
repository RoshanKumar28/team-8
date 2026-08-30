"use client";

/* Uploaded reports live in the browser, not on any server — a deliberate
   privacy stance for health documents. Images are downscaled before storing
   so localStorage quota survives; oversized files are kept out gracefully. */

const KEY = "ovy.files";

type FileStore = Record<string, { dataUrl: string; name: string; type: string }>;

function read(): FileStore {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}

export function saveReportFile(id: string, name: string, type: string, dataUrl: string): boolean {
  try {
    const all = read();
    all[id] = { dataUrl, name, type };
    localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch { return false; } // quota — extraction still works, download just won't
}

export function getReportFile(id: string) {
  return read()[id] ?? null;
}

export async function fileToStorableDataUrl(f: File): Promise<string | null> {
  if (f.type.startsWith("image/")) {
    const url = URL.createObjectURL(f);
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i); i.onerror = rej; i.src = url;
      });
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.82);
    } finally { URL.revokeObjectURL(url); }
  }
  if (f.size > 3_500_000) return null; // a PDF this big would blow the quota
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => res(null);
    r.readAsDataURL(f);
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}

export function downloadText(text: string, filename: string) {
  downloadDataUrl(`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`, filename);
}
