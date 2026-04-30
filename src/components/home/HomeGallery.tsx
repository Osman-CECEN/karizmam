import { SafeImage } from "@/components/SafeImage";

const images = [
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/gallery-4.jpg",
  "/images/gallery-5.jpg",
  "/images/gallery-6.jpg",
] as const;

const labels = [
  "Galeri 1",
  "Galeri 2",
  "Galeri 3",
  "Galeri 4",
  "Galeri 5",
  "Galeri 6",
] as const;

export default function HomeGallery() {
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
          Fotoğraf ızgarası; görseller hazır olduğunda yollar otomatik
          dolar. Şimdilik örnek yollar kullanılır.
        </p>
        <ul
          className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3"
          role="list"
        >
          {images.map((src, i) => (
            <li key={src}>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <SafeImage
                  src={src}
                  alt={labels[i] ?? "Galeri"}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  wrapperClassName="aspect-square w-full"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
