import type { Metadata } from "next";
import InnerPageShell from "@/components/InnerPageShell";
import { site } from "@/lib/site";
import { getSiteOrigin } from "@/lib/site/origin";

export const metadata: Metadata = {
  title: "Motosiklet Ehliyeti",
  description: `Motosiklet ehliyet aşamaları ve sürücü kursu. ${site.city} Karizmam: kayıt ve sınıf sınırları hakkında güncel bilgiyi birlikte netleştirelim.`,
  alternates: { canonical: `${getSiteOrigin()}/motosiklet-ehliyeti` },
  openGraph: { title: `Motosiklet Ehliyeti | ${site.name}` },
};

export default function MotorbikePage() {
  return (
    <InnerPageShell
      kicker="Motosiklet (A sınıfı aileleri)"
      title="Motosiklet Ehliyeti"
      lead="Motosiklet ehliyet türü; silindir hacmi, yaş ve mevcut ehliyet durumunuza göre ayrışır. Hangi aşamada olduğunuzu, hangi sınıfın size uyduğunu, kayıt öncesi bize aktarmanız doğru rehberlik için önemlidir."
    >
      <h2>Genel çerçeve</h2>
      <p>
        Adaylık, teorik/uygulama eğitimleri, sınav takvimi ve
        sınava yönelik aşamalar, resmî düzenlemeler ve kurum
        uygulamasıyla yürür. Sitede sizi yönlendirecek sabit
        hızlı bir sonuç vaadi vermiyoruz; sadece açık iletişim
        ve netleyici bilgilendirme sunuyoruz.
      </p>
      <h2>Güvenli eğitim odağı</h2>
      <p>
        Motosiklet, trafikte fark edilen risklere açık bir
        sınıftır. Eğitim sürecini aceleye kaptırmamak, zorunlu
        aşamaları tamamlamak ve direksiyon/alan uygulamalarında
        aşamalı ilerlemek; sürdürülebilir sürüş alışkanlıkları
        açısından değerlidir. Bu, Karizmam ile görüşmelerinizde
        konuştuğunuz noktalar arasındadır.
      </p>
      <h2>Bir sonraki adım</h2>
      <p>
        Aşağıdaki butonlardan bize ulaşarak; sınıf uygunluğu, kayıt
        evrakları ve müsaitlik hakkında güncel, abartısız bilgiyi
        alabilirsiniz.
      </p>
    </InnerPageShell>
  );
}
