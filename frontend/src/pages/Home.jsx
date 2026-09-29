import React from 'react';
import Hero from '../components/home/Hero.jsx';
import StatsSection from '../components/home/StatsSection.jsx';
import AIFeaturesSection from '../components/home/AIFeaturesSection.jsx';
import MarketplacePreview from '../components/home/MarketplacePreview.jsx';
import HowItWorks from '../components/home/HowItWorks.jsx';
import PriceInsightDemo from '../components/home/PriceInsightDemo.jsx';
import FarmerBenefits from '../components/home/FarmerBenefits.jsx';
import FinalCTA from '../components/home/FinalCTA.jsx';

// The homepage is composed of one component per section (see components/home/).
// Splitting it this way keeps each piece small enough to explain on its own,
// and makes re-ordering or removing a section a one-line change here.
export default function Home() {
  return (
    <div>
      <Hero />
      <StatsSection />
      <AIFeaturesSection />
      <MarketplacePreview />
      <HowItWorks />
      <PriceInsightDemo />
      <FarmerBenefits />
      <FinalCTA />
    </div>
  );
}
