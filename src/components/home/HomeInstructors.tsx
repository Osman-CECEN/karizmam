import { SafeImage } from "@/components/SafeImage";

const cardBase =
  "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.14] bg-gradient-to-b from-white/[0.11] to-white/[0.04] p-1 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.6)] outline outline-1 outline-white/[0.07] transition-all duration-300 ease-out motion-safe:hover:z-10 motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02] motion-safe:hover:shadow-[0_24px_56px_-14px_rgba(0,0,0,0.7),0_0_0_1px_rgba(250,204,21,0.28),0_0_56px_-18px_rgba(250,204,21,0.22)] motion-safe:hover:outline-[#FACC15]/40";

/** Sıra ve görseller canlı sitedeki egitmenlerimiz.php ile eşleştirildi (karizmam.com). */
const topRow = [
  {
    name: "Ali ÇEÇEN",
    role: "Kurucu",
    image: "/images/instructors/ali-cecen.jpg",
    featured: true as const,
  },
  {
    name: "Abdullah TÜRK",
    role: "Direksiyon Sorumlusu",
    image: "/images/instructors/abdullah-turk.jpg",
    featured: false as const,
  },
  {
    name: "Zöhre EMUR",
    role: "Halkla ilişkiler",
    image: "/images/instructors/zohre-emur.jpg",
    featured: false as const,
  },
] as const;

const rest = [
  {
    name: "Meral ERCİL",
    role: "Eğitmen",
    image: "/images/instructors/meral-ercil.jpg",
  },
  {
    name: "Yasemin TUNÇOĞLU",
    role: "Eğitmen",
    image: "/images/instructors/yasemin-tuncoglu.jpg",
  },
  {
    name: "Özcan ÇETİN",
    role: "Eğitmen",
    image: "/images/instructors/ozcan-cetin.jpg",
  },
  {
    name: "Engin ATABEY",
    role: "Eğitmen",
    image: "/images/instructors/engin-atbey.jpg",
  },
  {
    name: "Gökhan ALICI",
    role: "İlk Yardım Öğretmeni",
    image: "/images/instructors/gokhan-alici.jpg",
  },
  {
    name: ".......",
    role: "Trafik Öğretmeni",
    image: "/images/instructors/trafik-ogretmeni.jpg",
  },
  {
    name: "Osman ÇEÇEN",
    role: "Evrak Kayıt",
    image: "/images/instructors/osman-cecen.jpg",
  },
] as const;

type CardProps = {
  name: string;
  role: string;
  image: string;
  featured: boolean;
  sizes: string;
};

function InstructorCard({ name, role, image, featured, sizes }: CardProps) {
  return (
    <article className={cardBase}>
      <div className="relative w-full overflow-hidden rounded-[1.2rem]">
        <SafeImage
          src={image}
          alt={name}
          variant="onDark"
          sizes={sizes}
          wrapperClassName={
            featured
              ? "aspect-[3/4] w-full sm:aspect-[5/6] lg:aspect-[4/5] lg:min-h-[min(28rem,52vh)]"
              : "aspect-[4/3] w-full sm:aspect-[3/2] lg:aspect-[16/10] lg:min-h-[13rem]"
          }
          className={
            featured
              ? "object-cover object-[center_15%]"
              : "object-cover object-center"
          }
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0B2A4A]/90 via-[#0B2A4A]/25 to-transparent"
          aria-hidden
        />
      </div>
      <div
        className={
          featured
            ? "flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-5"
            : "flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4"
        }
      >
        <h3
          className={
            featured
              ? "text-xl font-bold tracking-tight text-white sm:text-2xl"
              : "text-lg font-bold tracking-tight text-white sm:text-xl"
          }
        >
          {name}
        </h3>
        <p className="mt-1.5 text-sm font-medium leading-snug text-white/60 sm:text-[0.9375rem]">
          {role}
        </p>
      </div>
    </article>
  );
}

export default function HomeInstructors() {
  const [ali, abd, zohre] = topRow;

  return (
    <section
      className="relative overflow-hidden border-b border-white/10 bg-[#0B2A4A] py-16 md:py-20"
      aria-labelledby="instructors-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_60%_at_50%_-18%,rgba(250,204,21,0.1),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FACC15]/40 to-transparent"
        aria-hidden
      />

      <div className="section-px relative">
        <div className="max-w-3xl">
          <h2
            id="instructors-title"
            className="text-3xl font-extrabold tracking-tight text-white md:text-4xl md:leading-tight"
          >
            Eğitmenlerimiz
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/75">
            Kurucu ve eğitmen kadromuz; direksiyon, trafik, ilk yardım ve idari
            birimlerle birlikte görev alır.
          </p>
        </div>

        <ul
          className="mt-12 grid list-none gap-6 sm:gap-7 lg:mt-14 lg:grid-cols-12 lg:grid-rows-2 lg:gap-8"
          role="list"
        >
          <li className="lg:col-span-7 lg:row-span-2">
            <InstructorCard
              name={ali.name}
              role={ali.role}
              image={ali.image}
              featured
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </li>
          <li className="lg:col-span-5 lg:row-start-1">
            <InstructorCard
              name={abd.name}
              role={abd.role}
              image={abd.image}
              featured={false}
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </li>
          <li className="lg:col-span-5 lg:row-start-2">
            <InstructorCard
              name={zohre.name}
              role={zohre.role}
              image={zohre.image}
              featured={false}
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </li>
        </ul>

        <ul
          className="mt-10 grid list-none gap-6 sm:grid-cols-2 sm:gap-7 lg:mt-12 lg:grid-cols-3 lg:gap-8"
          role="list"
        >
          {rest.map((p) => (
            <li key={p.name}>
              <InstructorCard
                name={p.name}
                role={p.role}
                image={p.image}
                featured={false}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
