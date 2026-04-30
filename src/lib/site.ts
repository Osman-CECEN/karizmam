/**
 * İletişim alanlarını bu dosyadan tanımlayın.
 * Boş bırakıldığında sitede dürüst bilgilendirme metinleri gösterilir.
 */

export const site = {
  name: "Karizmam Sürücü Kursu",
  shortName: "Karizmam",
  city: "Erzincan",
  /**
   * Uluslararası formatta, sadece rakam, örnek: 905551234567
   */
  phoneE164: "" as const,
  /** ekranda göstermek istediğiniz numara; boşsa açık metin kullanılır */
  phoneLabel: "" as const,
  /** wa.me için: 905551234567 (artı yok) */
  whatsappE164: "" as const,
  /** Tek satırlık açık adres; boşsa açık metin kullanılır */
  address: "" as const,
} as const;

const digits = (s: string) => s.replace(/\D/g, "");

export function getPhoneDisplay(): string {
  const t = (site.phoneLabel as string).trim();
  if (t) return t;
  return "Telefon bilgisi eklenecek";
}

export function getPhoneHref(): string | null {
  const n = digits(site.phoneE164 as string);
  if (!n) return null;
  return `tel:+${n}`;
}

export function getWhatsAppHref(): string | null {
  const n = digits(site.whatsappE164 as string);
  if (!n) return null;
  return `https://wa.me/${n}`;
}

export function getAddressDisplay(): string {
  const t = (site.address as string).trim();
  if (t) return t;
  return "Adres bilgisi eklenecek";
}
