import { LangProvider } from "@/components/landing/i18n";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks, Tracks, CtaBand, Footer } from "@/components/landing/Sections";
import { TechStack, WhyNoah } from "@/components/landing/MoreSections";

/**
 * Landing de Remi — estilo Coinbase, bilingüe (toggle EN/ES, default EN),
 * animada con motion. El chat vive en /app.
 */
export default function Landing() {
  return (
    <LangProvider>
      <main>
        <Nav />
        <Hero />
        <HowItWorks />
        <WhyNoah />
        <TechStack />
        <Tracks />
        <CtaBand />
        <Footer />
      </main>
    </LangProvider>
  );
}
