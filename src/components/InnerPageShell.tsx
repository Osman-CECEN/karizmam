import Link from "next/link";
import { ContactActionButtons } from "@/components/ContactActionButtons";

type Props = {
  title: string;
  kicker?: string;
  lead: string;
  children: React.ReactNode;
};

export default function InnerPageShell({
  title,
  kicker,
  lead,
  children,
}: Props) {
  return (
    <main className="flex min-h-0 w-full min-h-full flex-1 flex-col">
      <div className="border-b border-gray-200 bg-surface shadow-sm">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-12">
          {kicker ? (
            <p className="text-sm font-semibold text-gray-600">{kicker}</p>
          ) : null}
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base font-normal leading-relaxed text-gray-600">
            {lead}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-10">
        <div className="prose-article text-sm text-[#111111] leading-relaxed md:text-base [&_p+_p]:mt-4">
          {children}
        </div>
      </div>

      <section className="border-t border-gray-200 bg-surface">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
          <h2 className="text-lg font-extrabold text-[#111111]">Detay ve kayıt</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Sınıfınıza ve müsaitliğinize özel ayrıntıları bize
            sorduğunuzda, güncel koşullar kısaca size aktarılır. İletişim için:
          </p>
          <div className="mt-6">
            <ContactActionButtons size="md" />
          </div>
          <p className="mt-6 text-sm text-gray-600">
            <Link
              href="/"
              className="font-semibold text-[#111111] underline underline-offset-2 transition-opacity hover:opacity-80"
            >
              Ana sayfaya dön
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
