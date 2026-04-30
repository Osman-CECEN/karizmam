import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { getAddressDisplay, getPhoneDisplay, getPhoneHref } from "@/lib/site";

const quick = [
  { href: "/b-sinifi-ehliyet", label: "B Sınıfı Ehliyet" },
  { href: "/motosiklet-ehliyeti", label: "Motosiklet Ehliyeti" },
  { href: "/direksiyon-dersi", label: "Direksiyon Dersi" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export default function SiteFooter() {
  const address = getAddressDisplay();
  const phoneText = getPhoneDisplay();
  const phoneHref = getPhoneHref();

  return (
    <footer className="mt-auto border-t-4 border-brand bg-ink text-surface/90">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-surface">Karizmam Sürücü Kursu</p>
            <p className="mt-3 max-w-prose text-sm text-surface/80">
              Erzincan&apos;da ehliyet ve direksiyon eğitimi. Kayıt süreci ve
              dersler hakkında bilgi almak için iletişime geçin.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-surface">Hızlı bağlantılar</p>
            <ul className="mt-4 space-y-2" role="list">
              {quick.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-surface/80 underline-offset-2 hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-surface">İletişim</p>
            <ul className="mt-4 space-y-3 text-sm" role="list">
              <li className="flex gap-2 text-surface/90">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  strokeWidth={2.25}
                  aria-hidden
                />
                <span className="break-words">{address}</span>
              </li>
              <li className="flex items-start gap-2 text-surface/90">
                <Phone
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  strokeWidth={2.25}
                  aria-hidden
                />
                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className="underline-offset-2 hover:underline"
                  >
                    {phoneText}
                  </a>
                ) : (
                  <span className="text-surface/80">{phoneText}</span>
                )}
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-surface/15 pt-6 text-center text-xs text-surface/60">
          © {new Date().getFullYear()} Karizmam Sürücü Kursu. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
