const reasons = [
  "Abartılı vaat yok",
  "Açık süreç anlatımı",
  "Öğrenciye uygun ders planı",
  "İletişimi kolay ekip",
] as const;

export default function HomeWhy() {
  return (
    <section
      className="section-y border-b border-gray-200 bg-surface"
      aria-labelledby="why-title"
    >
      <div className="section-px">
        <h2
          id="why-title"
          className="text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl"
        >
          Neden Karizmam?
        </h2>
        <ul
          className="mt-6 grid list-none grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4"
          role="list"
        >
          {reasons.map((r) => (
            <li
              key={r}
              className="flex min-h-0 items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:items-center sm:gap-4 sm:px-5 sm:py-4"
            >
              <div
                className="mt-1.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-gray-200 bg-[#FACC15]/40 sm:mt-0"
                aria-hidden
              >
                <span className="h-2 w-2 rounded-full bg-[#111111]" />
              </div>
              <span className="text-left text-sm font-medium leading-relaxed text-[#111111] sm:text-base">
                {r}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl text-sm text-gray-600 sm:mt-8 sm:text-base sm:leading-relaxed">
          Başka kurumlarda gördüğünüzden farklı bir üslubumuz olabilir: önce
          dürüst anlatır, sonra sizinle yürüyeceğiniz yolu planlarız.
        </p>
      </div>
    </section>
  );
}
