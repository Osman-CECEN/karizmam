import type { Metadata } from "next";
import InnerPageShell from "@/components/InnerPageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "B Sınıfı Ehliyet",
  description: `${site.city}’da B sınıfı sürücü kursu. Teorik ve uygulamalı eğitim, kayıt ve derslere dair net bilgi için Karizmam ile iletişime geçin.`,
  openGraph: { title: `B Sınıfı Ehliyet | ${site.name}` },
};

export default function BClassPage() {
  return (
    <InnerPageShell
      kicker="B sınıfı (otomobil)"
      title="B Sınıfı Ehliyet"
      lead="B sınıfı, belirli ağırlık ve yolcu sınırı içinde binek otomobil kullanımı için gerekli ehliyet türüdür. Kayıt koşulları, dokümanlar ve ders planı; güncel yönetmelik ve sizin durumunuza göre değişebilir."
    >
      <h2>Bu sayfada neleri netleştiririz</h2>
      <p>
        İlk temasta sizden yaş, sağlık durumu, daha önce ehliyet
        tecrübeniz (varsa) gibi etkenleri anlarız. Ardından teorik
        sınıflar, sınavlara yönelik eğitim saatleri ve direksiyon
        aşamaları hakkında, size özel toplu bir yol haritası öneririz; net
        süre sözü vermek her zaman doğru değildir, çünkü resmî
        aşamalar bakanlık takvimine de bağlıdır.
      </p>
      <h2>Neden doğrudan iletişim</h2>
      <p>
        Ücretler, sınıf kontenjanı ve sınava yönelik aşamalar
        dönemseldir. Telefon veya WhatsApp üzerinden, güncel durumu açık
        cümlelerle paylaşmanız, yanlış beklenti oluşmaması için
        faydalı olur. Burada sadece genel çerçeve sunuyoruz; ayrıntı
        kurumunuzdaki sorumlu ile netleşmelidir.
      </p>
      <h2>Direksiyon ve sınava hazırlık</h2>
      <p>
        B sınıfı için birebir direksiyon uygulamaları, tecrübe ve
        sürüş güveninize göre ilerleme hızı ve tekrar içeriği
        farklılık gösterebilir. Karizmam buna göre, abartısız ve ölçülü
        planlamayı tercih eder.
      </p>
    </InnerPageShell>
  );
}
