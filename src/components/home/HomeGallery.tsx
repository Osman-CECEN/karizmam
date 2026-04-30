import { SafeImage } from "@/components/SafeImage";
import { getPublicGalleryItems } from "@/lib/cms/getPublicGalleryItems";

export default async function HomeGallery() {
  const items = await getPublicGalleryItems();
  if (items.length === 0) return null;

  return (
    <section
      className="section-y border-b border-gray-200 bg-surface"
      aria-labelledby="gallery-title"
    >
      <div className="section-px">
        <h2
          id="gallery-title"
          className="text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl"
        >
          Galeri
        </h2>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Kurs ortamımızdan kareler: sınıflar, bahçe ve eğitim alanlarından
          seçilmiş fotoğraflar.
        </p>
        <ul
          className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3"
          role="list"
        >
          {items.map((item) => {
            const src = item.image_url!.trim();
            const alt = item.alt_text?.trim() || item.title.trim();
            return (
              <li key={item.id}>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <SafeImage
                    src={src}
                    alt={alt}
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    wrapperClassName="aspect-square w-full"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
