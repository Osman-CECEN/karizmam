/** Public object URL → storage object path inside `instructors` bucket (no bucket prefix). */
const PUBLIC_PATH_MARKER = "/storage/v1/object/public/instructors/";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024;

export function validateInstructorImageFile(file: File): string | null {
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

/** Dosya adından güvenli bir parça (çakışmayı azaltmak için timestamp ayrı eklenir). */
export function slugifyFileStem(originalName: string, maxLen = 48): string {
  const lastDot = originalName.lastIndexOf(".");
  const stem =
    lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const ascii = stem
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
  return ascii.length > 0 ? ascii : "foto";
}

/**
 * Bucket içi yol: `{instructor_id}/{timestamp}-{slug}.{ext}`
 * (Bucket adı `instructors`; tekrar prefix eklenmez.)
 */
export function buildInstructorObjectPath(
  instructorId: string,
  file: File
): string | null {
  const ext = extensionForMime(file.type);
  if (!ext) return null;
  const stem = slugifyFileStem(file.name);
  const ts = Date.now();
  return `${instructorId}/${ts}-${stem}.${ext}`;
}

export function parseInstructorStoragePathFromPublicUrl(
  url: string
): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    const idx = u.pathname.indexOf(PUBLIC_PATH_MARKER);
    if (idx === -1) return null;
    const rest = u.pathname.slice(idx + PUBLIC_PATH_MARKER.length);
    return rest.length > 0 ? decodeURIComponent(rest) : null;
  } catch {
    return null;
  }
}

export function turkishStorageErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("jwt") || m.includes("session")) {
    return "Oturum süresi dolmuş olabilir. Sayfayı yenileyip tekrar giriş yapın.";
  }
  if (m.includes("row-level security") || m.includes("policy")) {
    return "Bu işlem için yetkiniz doğrulanamadı. Yönetici olarak giriş yaptığınızdan emin olun.";
  }
  if (m.includes("duplicate") || m.includes("already exists")) {
    return "Aynı dosya yolu zaten kullanılıyor. Tekrar deneyin.";
  }
  if (m.includes("payload too large") || m.includes("entity too large")) {
    return "Dosya sunucu tarafında çok büyük görünüyor. Daha küçük bir görsel deneyin.";
  }
  return "Yükleme sırasında bir hata oluştu. Lütfen tekrar deneyin.";
}
