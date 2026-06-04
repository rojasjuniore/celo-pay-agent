import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks, Tracks, CtaBand, Footer } from "@/components/landing/Sections";

/**
 * Landing de Remi — estilo Coinbase (DESIGN.md): hero oscuro con mockup,
 * cómo funciona, los 3 tracks, CTA band, footer. El chat vive en /app.
 */
export default function Landing() {
  return (
    <main>
      <Nav />
      <Hero />
      <HowItWorks />
      <Tracks />
      <CtaBand />
      <Footer />
    </main>
  );
}
