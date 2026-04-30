import { ClipboardList } from "lucide-react";

const steps = [
  { n: 1, title: "Bizimle iletişime geç" },
  { n: 2, title: "Sana uygun eğitim planını belirleyelim" },
  { n: 3, title: "Derslerine başla" },
  { n: 4, title: "Sınav sürecine hazırlan" },
] as const;

export default function HomeProcess() {
  return (
    <section
      className="section-y border-b border-gray-200 bg-surface"
      aria-labelledby="process-title"
    >
      <div className="section-px">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-zinc-50/90 shadow-sm">
            <ClipboardList
              className="size-6 text-[#111111]"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
          <h2
            id="process-title"
            className="text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl"
          >
            Süreç
          </h2>
        </div>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Sıra ve ayrıntıları kişiselleştiririz; genel yol haritası şu şekildedir.
        </p>
        <ol className="m-0 mt-10 max-w-3xl list-none overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-sm">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className={`flex min-h-0 items-center gap-4 border-l-4 border-[#FACC15] py-3.5 pl-4 pr-2 sm:pl-5 ${
                i < steps.length - 1
                  ? "border-b border-gray-200"
                  : ""
              } bg-white`}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#111111] text-sm font-extrabold text-[#FACC15] shadow-sm"
                aria-hidden
              >
                {s.n}
              </span>
              <span className="min-w-0 text-sm font-semibold leading-snug text-[#111111] sm:text-base">
                {s.title}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
