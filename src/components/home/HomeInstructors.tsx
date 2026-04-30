import { SafeImage } from "@/components/SafeImage";
import { getPublicInstructors } from "@/lib/instructors/getPublicInstructors";
import type { InstructorRow } from "@/types/database";

const cardBase =
  "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.14] bg-gradient-to-b from-white/[0.11] to-white/[0.04] p-1 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.6)] outline outline-1 outline-white/[0.07] transition-all duration-300 ease-out motion-safe:hover:z-10 motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02] motion-safe:hover:shadow-[0_24px_56px_-14px_rgba(0,0,0,0.7),0_0_0_1px_rgba(250,204,21,0.28),0_0_56px_-18px_rgba(250,204,21,0.22)] motion-safe:hover:outline-[#FACC15]/40";

type Tier = "hero" | "mid" | "compact";

type CardProps = {
  name: string;
  role: string;
  image: string;
  tier: Tier;
  sizes: string;
};

function instructorImageAlt(name: string, role: string) {
  return `${name}, ${role} — Karizmam Sürücü Kursu eğitmeni`;
}

function InstructorCard({ name, role, image, tier, sizes }: CardProps) {
  const imageWrap =
    tier === "hero"
      ? "aspect-[4/5] w-full sm:aspect-[5/6] sm:min-h-[min(22rem,45vh)]"
      : tier === "mid"
        ? "aspect-[4/5] w-full sm:aspect-[3/4]"
        : "aspect-square w-full sm:aspect-[4/5]";

  const titleClass =
    tier === "hero"
      ? "text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl"
      : tier === "mid"
        ? "text-lg font-bold tracking-tight text-white sm:text-xl"
        : "text-base font-bold tracking-tight text-white sm:text-lg";

  const bodyPad =
    tier === "hero"
      ? "flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-8 sm:pb-7 sm:pt-5"
      : tier === "mid"
        ? "flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4"
        : "flex flex-1 flex-col px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3";

  const roleClass =
    tier === "compact"
      ? "mt-1 text-xs font-medium leading-snug text-white/60 sm:text-sm"
      : "mt-1.5 text-sm font-medium leading-snug text-white/60 sm:text-[0.9375rem]";

  const imgSrc = image.trim();

  return (
    <article className={cardBase}>
      <div className="relative w-full overflow-hidden rounded-[1.2rem]">
        <SafeImage
          src={imgSrc}
          alt={instructorImageAlt(name, role)}
          variant="onDark"
          sizes={sizes}
          wrapperClassName={imageWrap}
          className={
            tier === "hero"
              ? "object-cover object-[center_15%]"
              : "object-cover object-center"
          }
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0B2A4A]/90 via-[#0B2A4A]/25 to-transparent"
          aria-hidden
        />
      </div>
      <div className={bodyPad}>
        <h3 className={titleClass}>{name}</h3>
        <p className={roleClass}>{role}</p>
      </div>
    </article>
  );
}

function isPlaceholderName(name: string) {
  const t = name.trim();
  return t.length > 0 && /^\.+$/.test(t);
}

function splitByTier(rows: InstructorRow[]) {
  const visible = rows.filter((r) => !isPlaceholderName(r.name));
  if (visible.length === 0) {
    return { hero: null as InstructorRow | null, mid: [] as InstructorRow[], grid: [] as InstructorRow[] };
  }
  const hero = visible[0] ?? null;
  const mid = visible.slice(1, 3);
  const grid = visible.slice(3);
  return { hero, mid, grid };
}

export default async function HomeInstructors() {
  const rows = await getPublicInstructors();
  const { hero, mid, grid } = splitByTier(rows);
  if (rows.length === 0 || (!hero && mid.length === 0 && grid.length === 0)) {
    return null;
  }

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

        {hero ? (
              <div className="mt-12 flex justify-center lg:mt-14">
                <div className="w-full max-w-md sm:max-w-lg">
                  <InstructorCard
                    name={hero.name}
                    role={hero.role_title}
                    image={hero.image_url ?? ""}
                    tier="hero"
                    sizes="(max-width: 640px) 100vw, 32rem"
                  />
                </div>
              </div>
            ) : null}

        {mid.length > 0 ? (
              <ul
                className="mx-auto mt-10 grid max-w-4xl list-none gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-7 lg:mt-14"
                role="list"
              >
                {mid.map((p) => (
                  <li key={p.id}>
                    <InstructorCard
                      name={p.name}
                      role={p.role_title}
                      image={p.image_url ?? ""}
                      tier="mid"
                      sizes="(max-width: 768px) 100vw, 24rem"
                    />
                  </li>
                ))}
              </ul>
            ) : null}

        {grid.length > 0 ? (
              <ul
                className="mt-10 grid list-none gap-5 sm:grid-cols-2 sm:gap-6 md:mt-12 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4"
                role="list"
              >
                {grid.map((p) => (
                  <li key={p.id}>
                    <InstructorCard
                      name={p.name}
                      role={p.role_title}
                      image={p.image_url ?? ""}
                      tier="compact"
                      sizes="(max-width: 640px) 100vw, 20rem"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
      </div>
    </section>
  );
}
