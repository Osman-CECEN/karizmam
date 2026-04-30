import { ChevronDown } from "lucide-react";

const items = [
  {
    q: "Ehliyet süreci nasıl ilerler?",
    a: "Örnek açıklama. Genel aşamalar, kayıt ve sınava kadar yol, sonra sizin metninizle güncellenecektir.",
  },
  {
    q: "Direksiyon dersleri nasıl planlanır?",
    a: "Taslak: müsaitlik, saat ve tekrar, birlikte netleştirilir. Gerçek metin sonra düzenlenir.",
  },
  {
    q: "Motosiklet ehliyeti için hangi sınıflar var?",
    a: "Özet şema metni. Yönetmeliğe göre sınıflar, burada genişletilecektir.",
  },
  {
    q: "Kayıt için hangi belgeler gerekir?",
    a: "Örnek liste alanı. Belge isimleri ve güncel liste iletişimle paylaşılacaktır.",
  },
  {
    q: "Sınav sürecinde nasıl destek verilir?",
    a: "Örnek destek açıklaması. Sınava dönük hazırlık, sonra ayrıntılandırılabilir.",
  },
] as const;

export default function HomeFaq() {
  return (
    <section
      className="section-y border-b border-gray-200 bg-surface"
      aria-labelledby="faq-title"
    >
      <div className="section-px">
        <h2
          id="faq-title"
          className="text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl"
        >
          Sık sorulan sorular
        </h2>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Cevaplar taslak niteliğindedir; ayrıntılar sonra
          eklenebilir.
        </p>
        <div className="mx-auto mt-8 max-w-3xl space-y-0">
          {items.map((item) => (
            <details
              key={item.q}
              className="border-b border-gray-200 last:border-0 [summary::-webkit-details-marker]:hidden open:[&>summary>svg]:rotate-180"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left sm:py-5">
                <span className="min-w-0 text-base font-semibold text-[#111111] sm:text-lg">
                  {item.q}
                </span>
                <ChevronDown
                  className="size-5 shrink-0 text-[#111111] transition-transform duration-200"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </summary>
              <p className="pb-4 pl-0 text-sm leading-relaxed text-gray-600 sm:pb-5 sm:text-base">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
