"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type SafeImageProps = {
  src: string;
  alt: string;
  /** Dış sarıcı: `relative` + oran, ör. `aspect-[16/10] w-full rounded-2xl` */
  wrapperClassName: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Yükleme hatası alanı: koyu bölümlerde `onDark` kullanın */
  variant?: "default" | "onDark";
};

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
  variant = "default",
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const isDark = variant === "onDark";
    return (
      <div
        className={cn(
          "flex min-h-0 w-full items-center justify-center border-2 border-dashed",
          isDark
            ? "border-white/25 bg-white/[0.06] text-white/55"
            : "border-gray-200 bg-[#FFFFFF] text-gray-400",
          wrapperClassName
        )}
        role="img"
        aria-label={alt}
      >
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <ImageIcon
            className={cn(
              "size-8 shrink-0",
              isDark ? "opacity-45 text-white" : "opacity-40"
            )}
            strokeWidth={1.25}
            aria-hidden
          />
          <span
            className={cn(
              "text-xs font-medium",
              isDark ? "text-white/55" : "text-gray-500"
            )}
          >
            Görsel eklenecek
          </span>
        </div>
      </div>
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
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/** Aynı bileşenin alternatif adı (şablonlarda kullanım için). */
export { SafeImage as ImagePlaceholder };
