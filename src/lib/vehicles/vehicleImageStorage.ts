import { turkishStorageErrorMessage } from "@/lib/instructors/instructorImageStorage";

export { turkishStorageErrorMessage };

const VEHICLES_PUBLIC_MARKER = "/storage/v1/object/public/vehicles/";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024;

export function validateVehicleImageFile(file: File): string | null {
  if (file.size === 0) {
    return "Seçilen dosya boş görünüyor.";
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return "Yalnızca JPEG, PNG veya WebP formatları kabul edilir.";
  }
  if (file.size > MAX_BYTES) {
    return "Dosya boyutu en fazla 2 MB olabilir.";
  }
  return null;
}

export function extensionForMime(mime: string): "jpg" | "png" | "webp" | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

export function slugifyFileStem(originalName: string, maxLen = 48): string {
  const lastDot = originalName.lastIndexOf(".");
  const stem = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const ascii = stem
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
  return ascii.length > 0 ? ascii : "foto";
}

/** `{vehicle_id}/{timestamp}-{slug}.{ext}` */
export function buildVehicleObjectPath(
  vehicleId: string,
  file: File
): string | null {
  const ext = extensionForMime(file.type);
  if (!ext) return null;
  const stem = slugifyFileStem(file.name);
  const ts = Date.now();
  return `${vehicleId}/${ts}-${stem}.${ext}`;
}

export function parseVehicleStoragePathFromPublicUrl(
  url: string
): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    const idx = u.pathname.indexOf(VEHICLES_PUBLIC_MARKER);
    if (idx === -1) return null;
    const rest = u.pathname.slice(idx + VEHICLES_PUBLIC_MARKER.length);
    return rest.length > 0 ? decodeURIComponent(rest) : null;
  } catch {
    return null;
  }
}
