import { SafeImage } from "@/components/SafeImage";

const vehicles = [
  { id: "1", title: "Eğitim Aracı 1", image: "/images/car-1.jpg" },
  { id: "2", title: "Eğitim Aracı 2", image: "/images/car-2.jpg" },
  {
    id: "m1",
    title: "Motosiklet Eğitim Aracı",
    image: "/images/motorcycle-1.jpg",
  },
] as const;

export default function HomeVehicles() {
  return (
    <section
      className="section-y border-b border-gray-200 bg-surface"
      aria-labelledby="vehicles-title"
    >
      <div className="section-px">
        <h2
          id="vehicles-title"
          className="text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl"
        >
          Araçlarımız
        </h2>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Eğitimde kullanılan örnek araç vitrin satırı. Detay sonradan
          eklenebilir.
        </p>
        <ul
          className="mt-10 grid gap-6 sm:grid-cols-1 md:grid-cols-3"
          role="list"
        >
          {vehicles.map((v) => (
            <li key={v.id}>
              <article className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="border-b border-gray-100">
                  <SafeImage
                    src={v.image}
                    alt={v.title}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    wrapperClassName="aspect-[4/3] w-full"
                  />
                </div>
                <div className="p-4 text-center sm:p-5 sm:text-left">
                  <h3 className="text-base font-extrabold text-[#111111] sm:text-lg">
                    {v.title}
                  </h3>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
