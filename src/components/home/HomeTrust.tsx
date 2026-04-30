import { CheckCircle2 } from "lucide-react";

const items = [
  "Erzincan merkezde hizmet",
  "Deneyimli eğitmen kadrosu",
  "Birebir direksiyon eğitimi",
  "Net ve anlaşılır kayıt süreci",
] as const;

export default function HomeTrust() {
  return (
    <section
      className="section-y border-b border-gray-200 bg-surface"
      aria-labelledby="trust-title"
    >
      <div className="section-px">
        <h2 id="trust-title" className="sr-only">
          Güven ve yaklaşım
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-zinc-50/80 p-4 shadow-sm sm:p-5">
          <ul
            className="grid items-stretch gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-4 lg:gap-4"
            role="list"
          >
            {items.map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-3.5 text-left shadow-sm sm:py-4"
              >
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-[#111111]"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="text-sm font-semibold leading-snug text-[#111111] sm:text-sm">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
