import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsSection } from "@/components/landing/stats-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Features } from "@/components/Features";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <StatsSection />
      <Features />
      <PricingSection />
      <CtaSection />
    </>
  );
}
