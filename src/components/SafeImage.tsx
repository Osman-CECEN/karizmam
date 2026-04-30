"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

function initialsFromAlt(alt: string): string {
  const segs = alt.trim().split(/\s+/).filter((s) => s !== ".......");
  if (segs.length >= 2) {
    const a = segs[0]?.[0] ?? "";
    const b = segs[1]?.[0] ?? "";
    return (a + b).toUpperCase();
  }
  const one = segs[0] ?? alt;
  return one.slice(0, 2).toUpperCase();
}

type SafeImageProps = {
  src: string;
  alt: string;
  /** Dış sarıcı: `relative` + oran, ör. `aspect-[16/10] w-full rounded-2xl` */
  wrapperClassName: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Varsayılan: `lazy` (priority true iken `eager`) */
  loading?: "lazy" | "eager";
  /** Yükleme hatası alanı: koyu bölümlerde `onDark` kullanın */
  variant?: "default" | "onDark";
};

function FallbackBlock({
  alt,
  wrapperClassName,
  variant,
}: Pick<SafeImageProps, "alt" | "wrapperClassName" | "variant">) {
  const isDark = variant === "onDark";
  const initials = initialsFromAlt(alt);
  return (
    <div
      className={cn(
        "flex min-h-0 w-full items-center justify-center overflow-hidden",
        isDark
          ? "border border-white/[0.12] bg-gradient-to-br from-[#0e3d6b] via-[#0B2A4A] to-[#041018] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          : "border-2 border-dashed border-gray-200 bg-[#FFFFFF] text-gray-400",
        wrapperClassName
      )}
      role="img"
      aria-label={alt}
    >
      {isDark ? (
        <div className="relative flex flex-col items-center justify-center gap-2 p-6 text-center">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_20%,rgba(250,204,21,0.12),transparent_55%)]"
            aria-hidden
          />
          <span
            className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            aria-hidden
          >
            {initials}
          </span>
          <ImageIcon
            className="relative size-7 shrink-0 text-[#FACC15]/70"
            strokeWidth={1.25}
            aria-hidden
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <ImageIcon
            className="size-8 shrink-0 opacity-40"
            strokeWidth={1.25}
            aria-hidden
          />
          <span className="text-xs font-medium text-gray-500">
            Görsel eklenecek
          </span>
        </div>
      )}
    </div>
  );
}

type InnerProps = Omit<SafeImageProps, "src"> & { src: string };

function SafeImageLoad({
  src,
  alt,
  wrapperClassName,
  className,
  sizes,
  priority,
  loading,
  variant,
}: InnerProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <FallbackBlock alt={alt} wrapperClassName={wrapperClassName} variant={variant} />
    );
  }
  return (
    <div className={cn("relative min-h-0 w-full overflow-hidden", wrapperClassName)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={cn("object-cover", className)}
        priority={priority}
        loading={loading ?? (priority ? "eager" : "lazy")}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/**
 * Görsel yoksa veya yüklenemezse sınırı net, bozulmayan bir alan gösterir.
 * Her zaman `fill` kullanır; üst sarıcı yükseklik/oran sağlamalıdır.
 */
export function SafeImage({
  src,
  alt,
  wrapperClassName,
  className,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  priority = false,
  loading,
  variant = "default",
}: SafeImageProps) {
  const trimmed = src.trim();
  if (!trimmed) {
    return (
      <FallbackBlock alt={alt} wrapperClassName={wrapperClassName} variant={variant} />
    );
  }
  return (
    <SafeImageLoad
      key={trimmed}
      src={trimmed}
      alt={alt}
      wrapperClassName={wrapperClassName}
      className={className}
      sizes={sizes}
      priority={priority}
      loading={loading}
      variant={variant}
    />
  );
}

/** Aynı bileşenin alternatif adı (şablonlarda kullanım için). */
export { SafeImage as ImagePlaceholder };
