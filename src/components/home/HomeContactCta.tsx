import { ContactActionButtons } from "@/components/ContactActionButtons";

export default function HomeContactCta() {
  return (
    <section
      className="section-y border-t-4 border-t-[#FACC15] bg-surface"
      aria-labelledby="contact-cta-title"
    >
      <div className="section-px">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center shadow-md sm:px-6 md:py-16">
          <h2
            id="contact-cta-title"
            className="text-2xl font-extrabold tracking-tight text-[#111111] sm:text-3xl md:text-4xl"
          >
            Ehliyet sürecinizi netleştirmek için bize ulaşın
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-600 sm:mt-5 sm:text-base sm:leading-relaxed">
            Aşağıdaki yollarla sorularınızı ve uygunluk durumunuzu
            değerlendirebilirsiniz. Kayıt koşulları hakkında güncel bilgiyi
            yine bizden teyit etmenizi öneririz.
          </p>
          <div className="mt-8 flex w-full max-w-2xl flex-col items-stretch sm:mt-10 sm:mx-auto sm:items-center">
            <ContactActionButtons size="md" />
          </div>
        </div>
      </div>
    </section>
  );
}
