import type { Metadata } from "next";
import InnerPageShell from "@/components/InnerPageShell";
import { site } from "@/lib/site";
import { getSiteOrigin } from "@/lib/site/origin";

export const metadata: Metadata = {
  title: "Direksiyon Dersi",
  description: `Birebir direksiyon dersi ve sürüş uygulaması. ${site.name}, ${site.city}—ders sıklığı ve ilerleme, ihtiyaca ve mevcut becerinize göre belirlenir.`,
  alternates: { canonical: `${getSiteOrigin()}/direksiyon-dersi` },
  openGraph: { title: `Direksiyon Dersi | ${site.name}` },
};

export default function DrivingLessonPage() {
  return (
    <InnerPageShell
      kicker="Birebir uygulama"
      title="Direksiyon Dersi"
      lead="Direksiyon, sabit bir ders saatiyle herkese aynı hızda öğrenilen bir uygulama değildir. Ön deneme sürüşü, park hareketleri, şehir içi akıcı trafik ve sınava dönük tekrarlar aşamalı ilerletilir. Başlangıç seviyenize ve rahat ilerleme hızınıza saygı duyarız."
    >
      <h2>Nasıl planlarız</h2>
      <p>
        İlk etapta kısa bir sözlü değerlendirmeyle, daha önce
        araç kullandınız mı, sınava ne kadar süre ayırabilirsiniz
        gibi soruları açarız. Buna göre ders günlerini
        sizinle uyuşacak biçimde, mümkün aralıklar içinde
        değerlendirmeyi hedefleriz. Bunun, ortak bir
        sözleşmeden çok, çalışma ekipli bir karşılıklı
        sınırlar konuşması olması taraftarız.
      </p>
      <h2>Ne söylemek istemeyiz</h2>
      <p>
        “Bir günde hazır kılma” gibi cümlelere, gerçeği
        çarpıtma riski nedeniyle girmemeyi tercih ederiz. Uygulama
        sürerken gelişmeyi birlikte gözlemler, sınava yönelik
        aşamaları da resmî takvime ve öğrenci temposuna
        uyar.
      </p>
      <h2>Detay</h2>
      <p>
        Araç sınıfı, eğitmen eşleşmesi, müsait saat aralıkları
        hakkındaki güncel bilgiyi, doğrudan iletişimle
        almanızı isteriz.
      </p>
    </InnerPageShell>
  );
}
