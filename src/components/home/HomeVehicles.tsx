import { SafeImage } from "@/components/SafeImage";
import { getPublicVehicles } from "@/lib/cms/getPublicVehicles";

export default async function HomeVehicles() {
  const vehicles = await getPublicVehicles();
  if (vehicles.length === 0) return null;

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
          Teorik ve direksiyon eğitiminde kullandığımız araç filosu; güvenli ve
          güncel donanımla derslere hazırlanmanıza yardımcı olur.
        </p>
        <ul
          className="mt-10 grid gap-6 sm:grid-cols-1 md:grid-cols-3"
          role="list"
        >
          {vehicles.map((v) => {
            const src = v.image_url!.trim();
            const imgAlt = v.title.trim();
            return (
              <li key={v.id}>
                <article className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="border-b border-gray-100">
                    <SafeImage
                      src={src}
                      alt={imgAlt}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      wrapperClassName="aspect-[4/3] w-full"
                    />
                  </div>
                  <div className="p-4 text-center sm:p-5 sm:text-left">
                    <h3 className="text-base font-extrabold text-[#111111] sm:text-lg">
                      {v.title}
                    </h3>
                    {v.description?.trim() ? (
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {v.description.trim()}
                      </p>
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
