import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroBanner from './components/home/HeroBanner';
import StatsSection from './components/home/StatsSection';
import HowItWorks from './components/home/HowItWorks';
import PlaceholderSection from './components/home/PlaceholderSection';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    handleNavigate('finder');
  };

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Main Navigation Bar */}
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      <main style={{ flex: 1 }}>
        {/* 2. Hero Section */}
        <HeroBanner onGetStarted={handleGetStarted} />

        {/* 3. Verified Statistics Section */}
        <StatsSection />

        {/* 4. Platform Workflow Overview */}
        <HowItWorks />

        {/* 5. Team Modules Integration Section (Placeholders for Modules 2, 3, 4, 5) */}
        <PlaceholderSection onGetStarted={handleGetStarted} />
      </main>

      {/* 6. Comprehensive Responsive Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
